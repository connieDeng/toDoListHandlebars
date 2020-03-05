const util = require('util');

module.exports =  (app) => {
    mapUsers = (arr) => {
        let myMap = new Map();
        arr.forEach(e => {
            myMap.set(e.username, e.id);
        });
        return myMap;
    }
}