import axios from "axios";

const API_URL = "https://crudcrud.com/api/76c2a5d3e3384c91bd82456a6703535e/livros";

export const api = axios.create({
    baseURL: API_URL,
});