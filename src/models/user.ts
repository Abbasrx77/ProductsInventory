export type UserType  = {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    hash: string;
    salt: string;
}

type UserPassword = {
    password: string
}

export type UserDetails = UserType & UserPassword

export class User implements UserType {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    hash: string;
    salt: string;

    constructor(prenom: string, nom: string, email: string, hash: string, salt: string) {
        this.prenom = prenom;
        this.nom = nom;
        this.email = email;
        this.hash = hash;
        this.salt = salt;
    }
}