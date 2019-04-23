const uuid = require('uuid');
const bcrypt = require('bcryptjs');

const BaseModel = require('./BaseModel');

module.exports = {
    init(storage) {
        return class User extends BaseModel.init(storage) {
            constructor(data) {
                super();

                this._id = data.id;
                this._login = data.login;
                this._email = data.email;
                this._password = data.password;
            }
        
            static async save(data) {
                if (!data || !data.login || !data.password) {
                    throw new Error('Login and password must be defined');
                }
        
                const password = await bcrypt.hash(data.password, 10);
        
                return super.save({
                    login: data.login,
                    email: data.email,
                    password,
                });
            }
        
            static create(data) {
                return super.create({
                    ...data,
                    id: uuid()
                });
            }

            static get entityName() {
                return 'user';
            }
        
            get id() {
                return this._id;
            }
        
            get login() {
                return this._login;
            }
        
            get email() {
                return this._email;
            }
        
            get password() {
                return this._password;
            }
        
            set login(val) {
                this._login = val;
            }
        
            set email(val) {
                this._email = val;
            }
        
            toJSON() {
                return {
                    id: this.id,
                    login: this.login,
                    email: this.email,
                    password: this.password
                };
            }
        };
    }
};