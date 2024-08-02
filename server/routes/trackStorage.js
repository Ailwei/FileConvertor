const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { File } = require('../models/File');
const { User } = require('../models/User');
const { verifyUser } = require('./user');

router.get('/update-storage/:userId', verifyUser, async (req, res) => {
    const userId = req.params.userId;
    console.log('User ID:', userId);

    try {
        const userExists = await User.findById(userId).exec();
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const subscription = await Subscription.findOne({
            userId,
            $or: [
                { plan: 'basic', status: 'pending' },
                { plan: 'premium', status: 'paid' },
                { plan: 'LifeTime', status: 'paid' } 
            ]
        }).exec();

        console.log('Subscription:', subscription);

        let allocatedStorage;
        if (!subscription) {
            allocatedStorage = 0;
            console.log(`No valid subscription found for user ${userId}`);
        } else {
            
            switch (subscription.plan) {
                case 'basic':
                    allocatedStorage = subscription.status === 'pending' ? 5 : 0;
                    break;
                case 'premium':
                    allocatedStorage = subscription.status === 'paid' ? 100 : 0;
                    break;
                case 'LifeTime':
                    allocatedStorage = subscription.status === 'paid' ? Infinity : 0;
                    break;
                default:
                    allocatedStorage = 0;
            }
            console.log(`Allocated Storage for plan ${subscription.plan}: ${allocatedStorage}`);
        }

        const files = await File.find({ userId }).exec();
        console.log('Files found:', files);

        const totalUsedStorage = files.reduce((total, file) => total + file.size, 0);
        console.log('Total used storage (bytes):', totalUsedStorage);

        const allocatedStorageInBytes = allocatedStorage === Infinity ? Infinity : allocatedStorage * 1024 * 1024 * 1024;
        console.log(`Allocated Storage in Bytes: ${allocatedStorageInBytes}`);

        if (allocatedStorageInBytes !== Infinity && totalUsedStorage > allocatedStorageInBytes) {
            console.log('Used storage exceeds allocated storage');
            return res.status(400).json({ message: 'Used storage exceeds allocated storage' });
        }
        await File.updateMany(
            { userId },
            { allocatedStorage: allocatedStorageInBytes, usedStorage: totalUsedStorage }
        ).exec();

        const usedStorageInGB = totalUsedStorage / (1024 * 1024 * 1024);
        const remainingStorageInGB = allocatedStorage === Infinity
            ? 'Unlimited'
            : allocatedStorage - usedStorageInGB.toFixed(2);

        res.status(200).json({
            message: 'Storage allocation updated',
            allocatedStorage: allocatedStorage === Infinity ? 'Unlimited' : `${allocatedStorage} GB`,
            usedStorage: usedStorageInGB.toFixed(2),
            remainingStorage: allocatedStorage === Infinity
                ? 'Unlimited'
                : `${remainingStorageInGB.toFixed(2)} GB`
        });
    } catch (error) {
        console.error('Error updating storage allocation:', error);
        res.status(500).json({ message: 'Error updating storage allocation' });
    }
});

module.exports = {
    StorageRouter: router
};
