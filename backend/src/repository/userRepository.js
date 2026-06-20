const {User: UserModel} = require("../models/user");

class UserRepository {

    async findOne(id){
        const user = UserModel.findById(id);
        return user;
    }

    async findByName(username){
        const user = UserModel.findOne({user: username});
        return user;
    }

    async findAll(){
        const user = await UserModel.find();
        return user;
    }

    async delete(id){
        const del = UserModel.findByIdAndDelete(id);
        return del;
    }

    async create(user){
        const response = UserModel.create(user);
        return response;
    }

    async update(id, user){
        // Habilita a validação de Schema durante o update usando runValidators: true
        const update = UserModel.findByIdAndUpdate(id, user, { new: true, runValidators: true });
        return update;
    }
}

const userRepository = new UserRepository();
module.exports = userRepository;