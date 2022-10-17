import { products } from "../data/products.js";
import { cors } from "../data/cors.js";

export async function getProductsById(event) {
    console.log(`event: ${JSON.stringify(event)}`);

    const { pathParameters } = event;
    const productId = Number(pathParameters.id);

    if (!productId) {
        return {
            statusCode: 400,
            headers: { ...cors },
            body: JSON.stringify({
                message: "Product id was not provided or has a wrong type",
            }),
        };
    }

    const product = await products.find((product) => product.id === productId);

    if (!product) {
        return {
            statusCode: 404,
            headers: { ...cors },
            body: JSON.stringify({
                message: "Product Not Found",
            }),
        };
    }

    return {
        statusCode: 200,
        headers: { ...cors },
        body: JSON.stringify(product),
    };

}
