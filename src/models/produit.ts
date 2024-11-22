export type ProduitType = {
    id?: string,
    name: string,
    type: string,
    price: number,
    rating: number,
    warranty_years: number,
    available: boolean,
}

export class Produit implements ProduitType {
    id?: string;
    name: string;
    type: string;
    price: number;
    rating: number;
    warranty_years: number;
    available: boolean;

    constructor(id: string, name: string, type: string, price: number, rating: number, warranty_years: number, available: boolean) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.price = price;
        this.rating = rating;
        this.warranty_years = warranty_years;
        this.available = available;
    }

}