import React from "react";
import {Menu, Button, Icon} from "semantic-ui-react";
import {Link} from "react-router-dom";


export default () => {
    return (
        <Menu stackable style={{ marginTop: "50px"}}>

            <Button color="blue" as={Link} to="/">
                Gestion de Tokens ERC-20
            </Button>

            <Button color="green" as={Link} to="/loteria">
                Gestion de boletos
            </Button>

            <Button color="orange" as={Link} to="/premios">
                Premios de loteria
            </Button>

            <Button color="linkedin" href="https://www.linkedin.com/in/roberto-zeniquel-1769b9108/" >
                <Icon name="linkedin" /> LinkedIn
            </Button>

            <Button color="red" href="https://www.instagram.com/roberzeniquel/" >
                <Icon name="instagram" /> Instagram
            </Button>

            <Button color="facebook" href="https://www.facebook.com/roberzeniquel" >
                <Icon name="facebook" /> Facebook
            </Button>

        </Menu>
    );
}