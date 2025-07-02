const mongoose = require('mongoose');


const roleScheme = new mongoose.Schema({
    title: String,
    description: String,
    permissions: {
      type: Array,
      default: []
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
},
{
    timestamps: true
}
);

const Role = mongoose.model('Role', roleScheme, 'roles');

export default Role;