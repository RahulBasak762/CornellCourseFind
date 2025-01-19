import Form from "../components/Form"

function Register() {
    return <Form route="http://localhost:8000/api/user/register/" method="register" />
}

export default Register