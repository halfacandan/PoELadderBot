import request from 'dropin-request';

export async function MakeApiGetCallAsync(endpointPath: string, jwtToken: string | null = null): Promise<any> {
    const apiEndpoint = new URL(endpointPath, process.env.API_ENDPOINT_BASE).href;
    const options: any = {
        url: apiEndpoint,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Jwt-Auth': jwtToken
        }
    };
    
    return await MakeApiCallAsync(apiEndpoint, options);
}

export async function MakeApiPostCallAsync(endpointPath: string, jwtToken: string | null = null, postData: any = null): Promise<any> {
    const apiEndpoint = new URL(endpointPath, process.env.API_ENDPOINT_BASE).href;
    const options: any = {
        url: apiEndpoint,
        method: "POST",
        followAllRedirects: true,
        body: postData,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Jwt-Auth': jwtToken,
            'Content-Length': postData.length
        }
    };

    return await MakeApiCallAsync(apiEndpoint, options);
}

async function MakeApiCallAsync(apiEndpoint: string, options: any): Promise<any> {
    const method = options.method ?? "GET";
    console.log(method + " " + apiEndpoint);

    try {
        return await new Promise((resolve, reject) => {
            request(options, (error: any, response: any, body: any) => {
                if (error) reject(error);
                if (response.statusCode != 200) {
                    reject(null);
                }
                resolve(body);
            });
        });
    } catch (reason) {
        console.log(`The promise was rejected because (${reason})`);
    }
}
