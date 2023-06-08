import React, {Component} from "react";
import "./App.css";
import Web3 from "web3";
import contrato_loteria from "../abis/Loteria.json";
import {Icon} from "semantic-ui-react";
import winner from "../imagenes/winner.png";

class Premios extends Component {
    
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
            tokens_devolver: 0,
        }
    }


    // Funcion para generar ganador
    ganador = async (boletos_comprados, mensaje) => {
        try{
            console.log(mensaje);
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            await this.state.contract.methods.GenerarGanador().send({from: accounts[0]});
        }
        catch(err){
            this.setState({errorMessage: err.message});
        }
        finally {
            this.setState({loading: false});
        }
    }

    // Funcion para visualizar el Ganador
    ver_ganador = async (mensaje) => {
        try {
            console.log(mensaje);
            const  direccion_ganador = await this.state.contract.methods.direccion_ganador().call();
            alert(direccion_ganador);
            console.log(direccion_ganador);
        }
        catch (err) {
            this.setState({errorMessage: err.message});
        }
        finally {
            this.setState({loading: false});
        }
    }


    // Funcion para devolver Tokens
    devolver_tokens = async (devolucion, mensaje) => {
        try{
            console.log(mensaje);
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            await this.state.contract.methods.DevolverTokens(devolucion).send({from: accounts[0]});
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

                                <h2> Premios de la loteria </h2>

                                <a 
                                href="https://www.linkedin.com/in/roberto-zeniquel-1769b9108/"
                                target="_blank"
                                rel="noopener noreferrer">
                                    <p></p>
                                    <img src={winner} width="400" height="400" alt="" />
                                </a>
                                <p></p>


                                <h3> <Icon circular inverted color="red" name="winner" /> Generar ganador </h3>

                                <form onSubmit={(event) =>{
                                    event.preventDefault();
                                    const mensaje = "Generar ganador de la loteria en ejecucion...";
                                    this.ganador(mensaje);
                                }
                                }>

                                    <input  type="submit"
                                            className="bbtn btn-block btn-danger btn-sm"
                                            value="GENERAR GANADOR" />

                                </form>

                                <h3> <Icon circular inverted color="blue" name="winner" /> Ver ganador </h3>

                                <form onSubmit={(event) =>{
                                    event.preventDefault();
                                    const mensaje = "Ver ganador de la loteria en ejecucion...";
                                    this.ver_ganador(mensaje);
                                }
                                }>

                                    <input  type="submit"
                                            className="bbtn btn-block btn-primary btn-sm"
                                            value="VER GANADOR" />

                                </form>


                                <h3> <Icon circular inverted color="orange" name="ethereum" /> Devolver Tokens </h3>

                                <form onSubmit={(event) =>{
                                    event.preventDefault();
                                    const tokens_devolver = this.tokens_devolver.value;
                                    const mensaje = "Devolucion de Tokens en ejecucion...";
                                    this.devolver_tokens(tokens_devolver, mensaje);
                                }
                                }>

                                    <input type="text"
                                            className="form-control mb-1"
                                            placeholder="Numero de Tokens a devolver"
                                            ref={(input) => this.tokens_devolver = input} />
                                    
                                    <input  type="submit"
                                            className="bbtn btn-block btn-warning btn-sm"
                                            value="DEVOLVER TOKENS" />

                                </form>

                                </div>
                        </main>
                    </div>
                </div>
            </div>

        )
    }
}

export default Premios;