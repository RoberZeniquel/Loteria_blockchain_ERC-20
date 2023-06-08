// SPDX-License-Identifier: MIT
pragma solidity >0.4.4 <0.8.0;
pragma experimental ABIEncoderV2;
import "./ERC20.sol";


contract Loteria{

    // Instancia del contrato Token
    ERC20Basic private token;

    // Direcciones
    address public owner;
    address public contrato;
    address public direccion_ganador;

    // Numeros de Tokens a crear
    uint public tokens_creados = 10000;

    // Evento de compra de Tokens
    event ComprandoTokens (uint, address);

    constructor () public {
        token = new ERC20Basic(tokens_creados);
        owner = msg.sender;
        contrato = address(this);
    }

// ------------------------------ TOKEN ----------------------------------------

// Establecer el precio de los Tokens en ethers
function PrecioTokens(uint _numTokens) internal pure returns(uint){
    return _numTokens*(1 ether);
}

// Generar mas Tokens por la loteria
function GeneraTokens(uint _numTokens) public Unicamente(msg.sender){
    token.increaseTotalSupply(_numTokens);
}

// Modificador para hacer funciones solamente accesibles por el owner del contrato
modifier Unicamente(address _direccion){
    require (_direccion == owner, "No tienes permisos para ejecutar esta funcion.");
    _;
}

// Comprar Tokens para comprar boletos para la loteria
function CompraTokens(address _propietario, uint _numTokens) public payable{
    // Calcular el coste de los tokens
    uint coste = PrecioTokens(_numTokens);
    // Se requiere que el valos de ethers pagados sea equivalente al coste
    require (msg.value >= coste, "Compra menos Tokens o paga con mas ethers.");
    // Obtener el balance de Tokens del contrato
    uint Balance = TokensDisponibles();
    // Filtro para evaluar los Tokens a comprar con los Tokens disponibles
    require (_numTokens <= Balance, "Compra un numero de Tokens adecuado.");
    // Diferencia a pagar 
    uint returnValue = msg.value - coste;
    // Transferencia de la diferencia
    msg.sender.transfer(returnValue);
    // Transferencia de Tokens al comprador
    token.transfer(_propietario, _numTokens);
    // Emitir el evento de compra de Tokens
    emit ComprandoTokens(_numTokens, _propietario);
}

// Balance de Tokens en el contrato de loteria
function TokensDisponibles() public view returns(uint) {
    return token.balanceOf(contrato);
}

// Obtener el balance de Tokens acumulados en el bote
function Bote() public view returns(uint) {
    return token.balanceOf(owner);
}

// Obtener balance de Tokens de una persona
function MisTokens(address _propietario) public view returns(uint) {
    return token.balanceOf(_propietario);
}

// ------------------------------ LOTERIA ----------------------------------------

// Precio del boleto en Tokens
uint public PrecioBoleto = 5;
// Relacion entre la persona que compra los boletos y el numero de los boletos
mapping(address => uint []) idPersona_boletos;
// Relacion necessaria para identidicar al ganador
mapping(uint => address) ADN_boleto;
// Numero aleatorio
uint randNonce = 0;
// Boletos generados
uint [] boletos_comprados;
// Eventos
event boleto_comprado(uint, address);           // Evento cuando se compra un boleto
event boleto_ganador(uint);            // Evento del ganador
event tokens_devueltos(uint, address); // Evento para devolver Tokens

// Funcion para comprar boletos de loteria
function CompraBoleto(uint _boletos) public {
    // Precio total de los boletos a comprar
    uint precio_total = _boletos * PrecioBoleto;
    // Filtrado de los Tokens a pagar
    require(precio_total >= MisTokens(msg.sender), "Necesitas comprar mas Tokens.");
    // Transferencia de Tokens al owner -> bote/premio

    /* El cliente para la atraccion en Tokens:
    - Ha sido necesario crear una funcion en ERC20.sol con el nombre de "transferencia_loteria()".
    */

    token.transferencia_loteria(msg.sender, owner, precio_total);

    /*
    Lo que esto haria es tomar la marca de tiempo now, el msg.sender y un nonce
    (un numero que solo se utiliza una vez, para que no ejecutemos dos veces la 
    misma funcion de hash con los mismos parametros de entrada) en incremento.
    Luego se utiliza keccak56 para convertir estas entradas a un hash aleatorio,
    convertir ese hash a un uint y luego utilizamos %10000 para tomar los ultimos 4 digitos.
    Dando un valor aleatorio entre 0 - 9999.
    */

    for (uint i=0; i<_boletos; i++) {
        uint random = uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % 10000;
        randNonce ++;
        // Almacenamos los datos de los boletos
        idPersona_boletos[msg.sender].push(random);
        // Numero de boleto comprado
        boletos_comprados.push(random);
        // Asignacion del ADN del boleto para tener un ganador
        ADN_boleto[random] = msg.sender;
        // Emision del evento
        emit boleto_comprado(random, msg.sender);
    }
}

function TusBoletos() public view returns(uint [] memory){
    return idPersona_boletos[msg.sender];
}

// Funcion para generar un ganador e ingresarle los Tokens
function GenerarGanador() public Unicamente(msg.sender){
    // Debe haber boletos comprados para generar un ganador
    require(boletos_comprados.length > 0, "No hay boletos comprados");
    // Declaracion de la longitud del array
    uint longitud = boletos_comprados.length;
    // Aleatoriamente elijo un numero entre: 0 - longitud
    // 1 - Eleccion de una posicion aleatoria del array
    uint posicion_array = uint(uint(keccak256(abi.encodePacked(now))) % longitud);
    // 2 - Seleccion del numero aleatorio mediante la posicion del array aleatorio
    uint eleccion = boletos_comprados[posicion_array];
    // Emision del evento del ganador
    emit boleto_ganador(eleccion);
    // Recuperar la direccion del ganador
    direccion_ganador = ADN_boleto[eleccion];
    // Enviarle los Tokens del premio al ganador
    token.transferencia_loteria(msg.sender, direccion_ganador, Bote());
}

// Devolucion de los Tokens
function DevolverTokens(uint _numTokens) public payable{
    // El numero de Tokens a devolver debe ser mayor a 0
    require(_numTokens > 0 ,"Necesitas devolver un numero positivo de Tokens.");
    // El usuario/cliente debe tener los Tokens que desea devolver
    require(_numTokens <= MisTokens(msg.sender), "No tienes los Tokens que deseas devolver.");
    // DEVOLUCION:
    // 1. El cliente devuelve los Tokens
    // 2. La loteria paga los Tokens devueltos en Ethers
    token.transferencia_loteria(msg.sender, address(this), _numTokens);
    msg.sender.transfer(PrecioTokens(_numTokens));
    // Emision del evento
    emit tokens_devueltos(_numTokens, msg.sender);
}











}