"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Name = void 0;
const domain_error_1 = require("../errors/domain.error");
class Name {
    constructor(firstName, lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
        if (!firstName || !lastName) {
            throw new domain_error_1.DomainError('O nome do marinheiro deve conter nome e sobrenome.');
        }
    }
    get fullName() {
        return `${this.firstName.trim()} ${this.lastName.trim()}`;
    }
}
exports.Name = Name;
