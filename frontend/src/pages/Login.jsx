import Form from "../components/Form"
function Login() {
    return <Form route="http://localhost:8000/api/token/" method="login" />
}

export default Login