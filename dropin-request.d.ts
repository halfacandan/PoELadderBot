declare module 'dropin-request' {
    function request(options: any, callback: (error: any, response: any, body: any) => void): void;
    export = request;
}
