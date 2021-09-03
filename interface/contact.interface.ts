export interface Contact {
    name: string;
    address: {
        city?: string;
        street: string;
    };
    email: string;
    phone: {  test: string;}[];
}