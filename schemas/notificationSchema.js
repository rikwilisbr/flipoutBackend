const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userTo: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    userFrom:{type: mongoose.Schema.Types.ObjectId, ref:'User'},
    notificationsType:{type: String},
    opened:{type: Boolean, default: false},
    entityId: mongoose.Schema.Types.ObjectId, 
},{collection: 'notifications', timestamps: false})

NotificationSchema.statics.insertNotification = async (userTo, userFrom, notificationsType, entityId) => {
    const data = {
        userTo: userTo,
        userFrom: userFrom,
        notificationsType: notificationsType,
        entityId: entityId
    }

    await Notification.deleteOne(data).catch(error => console.log(error))
    return Notification.create(data).catch(error => console.log(error))
}

const Notification = mongoose.model('Notification', NotificationSchema)

module.exports = Notification