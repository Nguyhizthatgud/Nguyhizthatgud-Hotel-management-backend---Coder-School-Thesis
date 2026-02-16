// shared/utils/serviceClient.js
import axios from "axios";
import logger from "./logger.js";

class ServiceClient {
    constructor(baseURL) {
        this.client = axios.create({
            baseURL,
            timeout: 5000 // 5 second timeout
        });

        this.client.interceptors.request.use(
            (config) => {
                logger.info("Sending request to service", {
                    method: config.method.toUpperCase(),
                    url: `${config.baseURL}${config.url}`,
                });
                return config;
            },
            (error) => {
                logger.error("Error sending request to service", { error: error.message });
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => {
                logger.info("Received response from service", {
                    status: response.status,
                    url: response.config.url
                });
                return response;
            },
            (error) => {
                logger.error("Error receiving response from service", {
                    status: error.response?.status,
                    data: error.response?.data,
                    url: error.config.url,
                    error: error.message
                });

                if (error.response) {
                    // Create a new error object to pass to the next error handler
                    const serviceError = new Error(error.response.data.error?.message || "Service request failed");
                    serviceError.status = error.response.status;
                    serviceError.code = error.response.data.error?.code;
                    return Promise.reject(serviceError);
                } else if (error.request) {
                    const serviceError = new Error("No response received from service");
                    serviceError.status = 503; // Service Unavailable
                    serviceError.code = "SERVICE_UNAVAILABLE";
                    return Promise.reject(serviceError);
                } else {
                    return Promise.reject(error);
                }
            }
        );
    }

    get(url, config) {
        return this.client.get(url, config);
    }

    post(url, data, config) {
        return this.client.post(url, data, config);
    }

    put(url, data, config) {
        return this.client.put(url, data, config);
    }

    patch(url, data, config) {
        return this.client.patch(url, data, config);
    }

    delete(url, config) {
        return this.client.delete(url, config);
    }
}

export default ServiceClient;
