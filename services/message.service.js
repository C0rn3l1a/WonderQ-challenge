const moment = require('moment');
const {v4: uuid} = require('uuid');

class MessageService {

    static messages = new Map();
    static processing = new Map();
    static expirations = new Map();
    
    /**
     * @author N4cho!
     * @description Generates a unique id for the new message, adds the message to the queue and returns the id of the message
     * @static
     * @param {*} message - content of the message
     * @returns string
     * @memberof MessageService
     */
    static add_message(message) {
        const new_id = uuid();
        this.messages.set(new_id, message);
        return new_id;
    }

    /**
     * @author N4cho!
     * @description deletes a message from the processing map so it is not readded to the main queue and returns true if deleted or false if it is not in the map
     * @static
     * @param {string} id - uuid of the message
     * @returns boolean
     * @memberof MessageService
     */
    static finnish_processing(id) {
        return this.processing.delete(id);
    }

    /**
     * @author N4cho!
     * @description Checks a map with all the expiration times registered and if there are expirations before the current second all the messages assigned to that expiration are moved from the processing map to the main queue and the past expiration is removed
     * @static
     * @memberof MessageService
     */
    static check_expired() {
        const unix = moment().unix();        
        for(const expiration of this.expirations.keys()) {
            if(expiration <= unix) {
                let expirated_messages = this.expirations.get(expiration);
                for(const id of expirated_messages) {
                    if(this.processing.has(id)) {
                        const message = this.processing.get(id);
                        this.messages.set(id, message);
                        this.processing.delete(id);
                    }
                }
                this.expirations.delete(expiration);
            }
        }
    }

    /**
     * @author N4cho!
     * @description returns the earliest message from the queue, moves it to the processing map and adds its id to the expiration map with the provided processing time and if the queue is empty null is returned
     * @static
     * @param {number} processing_time - time that this message should take to be processed
     * @returns any
     * @memberof MessageService
     */
    static get_next_message(processing_time) {
         if(processing_time == null) {
            processing_time = parseInt(process.env.DEFAULT_PROCESSING_TIME || '10', 10);
        }
        this.check_expired();
        const entries = this.messages.entries();
        const {value, done} = entries.next()
        if(done){return null}
        const [id, message] = value;
        const expiration = moment().unix() + processing_time;
        this.processing.set(id, message);
        if(this.expirations.has(expiration)) {
            let ids = this.expirations.get(expiration);
            ids.push(id)
            this.expirations.set(expiration, ids);
        } else {
            this.expirations.set(expiration, [id]);
        }
        this.messages.delete(id);
        return message;
    }
}

module.exports = MessageService;