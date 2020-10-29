const router = require('express').Router();
const message_service = require('../services/message.service');
const {validate: validate_uuid} = require('uuid')


/** 
 * @function
 * @author N4cho!
 * @name readMessage
 * @description returns the next message from the main queue or an "No Content (204)" response if queue is empty
 * @param {string} time - query parameter that indicates the time this message should be hold as processing
 */
router.get('/readMessage',(req,res,next) => {
    try {
        let time
        if(req.query.time != null) {
            parsed_time = parseInt(req.query.time, 10);
            if(!isNaN(parsed_time)){
                time = parsed_time;
            }
        }
        let message = message_service.get_next_message(time);
        if(message == null) {
            res.status(204).send();
        } else {
            res.json(message);
        }
    } catch(error) {
        next(error);
    }
});

/** 
 * @function
 * @author N4cho!
 * @name addMessage
 * @description adds a message to the queue and returns its id or "Bad Request (400)" response if body is empty
 * @param {any} body - body of the request is interpreted as the message content
 */
router.post('/addMessage',(req,res,next) => {
    try {
        const message = req.body;
        const id = message_service.add_message(message);
        if(message == null) {
            next({status: 400, message: 'message should not be empty'});
        } else {
            res.status(200).send(id);
        }
    } catch(error) {
        next(error);
    }
});

/** 
 * @function
 * @author N4cho!
 * @name processMessage
 * @description adds a message to the queue and returns its id or "Bad Request (400)" response if body is empty
 * @param {string} ID - url param 
 */
router.patch('/processMessage/:ID',(req,res,next) => {
    try {
        const id = req.params.ID;
        if(!validate_uuid(id)) {
            next({status: 404, message: 'Invalid UUID'});
            return;
        }
        const finnished = message_service.finnish_processing(id);   
        if(finnished){
            res.status(200).send('Message Processed Correctly')
        } else {
            next({status: 404, message: 'Message Not Found'});
        }
    } catch(error) {
        next(error);
    }
});

module.exports = router;