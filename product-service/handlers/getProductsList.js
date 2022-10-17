import { cors } from "../data/cors.js";
import { products } from "../data/products.js";

export async function getProductsList(event) {
    console.log(`event: ${JSON.stringify(event)}`);

    return {
        statusCode: 200,
        headers: { ...cors },
        body: JSON.stringify(products),
    };

}