import React, {Component} from "react";
import "./App.css";
import Web3 from "web3";
import contrato_loteria from "../abis/Loteria.json";
import {Icon} from "semantic-ui-react";
import tokens from "../imagenes/tokens.png";

class Tokens extends Component {
    
    async componentWillMount() {
        // 1. Carga de Web3
        await this.loadWeb3();
        // 2. Carga de datos de la Blockchain
        await this.loadBlockChainData();
    }


    // 1. Carga de Web3
    async loadWeb3(){
        if(window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();    
        }
        else if(window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }
        else {
            window.alert("No hay ningun navegador detectado. Deberias considerar usar Metamask!");
        }
    }


    // 2. Carga de datos de la Blockchain
    async loadBlockChainData() {
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        this.setState({account: accounts[0]});
        console.log("Account: ", this.state.account);
        const networkId = "5777"; // Ganache -> 5777, Rinkeby -> 4, BSC -> 97
        console.log("NetworkId: ", networkId);
        const networkData = contrato_loteria.networks[networkId];
        console.log("NetworkData: ", networkData);

        if(networkData) {
            const abi = contrato_loteria.abi;
            console.log("abi: ", abi);
            const address = networkData.address;
            console.log("address", address);
            const contract = new web3.eth.Contract(abi, address);
            this.setState({contract});
        }
        else {
            window.alert("El Smart Contract no se ha desplegado en la red!");
        }
    }


    // Constructor
    constructor(props) {
        super(props);
        this.state = {
            contract: null,
            loading: false,
            errorMessage: "",
            account: "",
            comprador_tokens:"",
            cantidad: 0,
            balance_direccion: "",
            num_tokens: 0,
        }
    }

    // Funcion para realizar la compra de Tokens
    envio = async (comprador_tokens, cantidad, ethers, mensaje) => {
        try{
            console.log(mensaje);
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            await this.state.contract.methods.CompraTokens(comprador_tokens, cantidad).send({from: accounts[0], value: ethers});
        }
        catch(err){
            this.setState({errorMessage: err.message});
        }
        finally {
            this.setState({loading: false});
        }
    }

    // Funcion para visualizar el numero de Tokens que tiene una persona
    balance_persona = async (direccion, mensaje) => {
        try{
            console.log(mensaje);
            const balance_direccion = await this.state.contract.methods.MisTokens(direccion).call();
            alert(parseFloat(balance_direccion));
        }
        catch(err){
            this.setState({errorMessage: err.message});
        }
        finally {
            this.setState({loading: false});
        }
    }

    // Funcion para visualizar el numero de Tokens que tiene el Smart Contract
    balance_contrato = async (mensaje) => {
        try{
            console.log(mensaje);
            const balance = await this.state.contract.methods.TokensDisponibles().call();
            alert(parseFloat(balance));
        }
        catch(err){
            this.setState({errorMessage: err.message});
        }
        finally {
            this.setState({loading: false});
        }
    }

    // Funcion para incrementar el numero de Tokens del Smart Contract
    incremento_tokens = async (num_tokens, mensaje) => {
        try{
            console.log(mensaje);
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            await this.state.contract.methods.GeneraTokens(num_tokens).send({from: accounts[0]});
        }
        catch(err){
            this.setState({errorMessage: err.message});
        }
        finally {
            this.setState({loading: false});
        }
    }



    // Render de la Dapp
    render() {
        return(
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <a
                    className="navbar-brand col-sm-3 col-md-2 mr-0"
                    href="https://frogames.es/rutas-de-aprendizaje"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    Dapp
                    </a>

                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                            <small className="text-white"><span id="account"> Cuenta activa: {this.state.account} </span></small>
                        </li>
                    </ul>
                </nav>
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                            <div className="content mr-auto ml-auto">
                                
                                <h1> Loteria con Tokens ERC-20 </h1>

                                <h2> Gestion y control de Tokens de la Loteria </h2>

                                <a 
                                href="https://www.linkedin.com/in/roberto-zeniquel-1769b9108/"
                                target="_blank"
                                rel="noopener noreferrer">
                                    <p></p>
                                    <img src={tokens} width="450" height="400" alt="" />
                                </a>
                                <p></p>

                                <h3> <Icon circular inverted color="red" name="dollar" /> Compra Tokens ERC-20 </h3>

                                <form onSubmit={(event) =>{
                                    event.preventDefault();
                                    const comprador_tokens = this.comprador_tokens.value;
                                    const cantidad = this.cantidad.value;
                                    const web3 = window.web3;
                                    const ethers = web3.utils.toWei(this.cantidad.value, "ether");
                                    const mensaje = "Compra de Tokens en ejecucion...";
                                    this.envio(comprador_tokens, cantidad, ethers, mensaje);
                                }
                                }>
                                    
                                    <input type="text"
                                            className="form-control mb-1"
                                            placeholder="Direccion de envio de los Tokens"
                                            ref={(input) => this.comprador_tokens = input} />

                                    
                                    <input  type="text"
                                            className="form-control mb-1"
                                            placeholder="Cantidad de Tokens a comprar"
                                            ref={(input) => this.cantidad = input} />
                                    
                                    <input  type="submit"
                                            className="bbtn btn-block btn-danger btn-sm"
                                            value="COMPRAR TOKENS" />

                                </form>


                                <h3> <Icon circular inverted color="orange" name="bitcoin" /> Balance de Tokens de un usuario</h3>

                                <form onSubmit={(event) =>{
                                    event.preventDefault();
                                    const balance_direccion = this.balance_direccion.value;
                                    const mensaje = "Balance de Tokens de un usuario en ejecucion...";
                                    this.balance_persona(balance_direccion, mensaje);
                                }
                                }>
                                    
                                    <input type="text"
                                            className="form-control mb-1"
                                            placeholder="Direccion del usuario"
                                            ref={(input) => this.balance_direccion = input} />

                                    
                                    <input  type="submit"
                                            className="bbtn btn-block btn-warning btn-sm"
                                            value="BALANCE USUARIO" />

                                </form>


                                <h3> <Icon circular inverted color="green" name="bitcoin" /> Balance de Tokens del Smart Contract </h3>

                                <form onSubmit={(event) =>{
                                    event.preventDefault();
                                    const mensaje = "Balance del Smart Contract en ejecucion...";
                                    this.balance_contrato(mensaje);
                                }
                                }>
                                    
                                    <input  type="submit"
                                            className="bbtn btn-block btn-success btn-sm"
                                            value="BALANCE DEL SMART CONTRACT" />

                                </form>


                                <h3> <Icon circular inverted color="blue" name="bitcoin" /> Incrementar Tokens del Smart Contract </h3>

                                <form onSubmit={(event) =>{
                                    event.preventDefault();
                                    const num_tokens = this.num_tokens.value;
                                    const mensaje = "Incremento de tokens del Smart Contract en ejecucion...";
                                    this.incremento_tokens(num_tokens, mensaje);
                                }
                                }>

                                    <input type="text"
                                            className="form-control mb-1"
                                            placeholder="Numero de Tokens a incrementar"
                                            ref={(input) => this.num_tokens = input} />
                                    
                                    <input  type="submit"
                                            className="bbtn btn-block btn-primary btn-sm"
                                            value="INCREMENTO DE TOKENS" />

                                </form>

                                <p></p>

                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }
}

export default Tokens;