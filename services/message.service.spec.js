const expect = require('chai').expect;
const { validate: validate_uuid } = require('uuid')
const message_service = require('./message.service');

describe('Message Service Functionalities',() => {
    describe('Add a new message to the queue',() => {
        after(() => {
            message_service.messages = new Map();
        })
        it('Should add a JSON message to the queue and return a unique id',(done) => {
            const message = {foo: 'bar'};
            const message_id = message_service.add_message(message);
            expect(validate_uuid(message_id)).to.be.true;
            expect(message_service.messages).to.include.key(message_id);
            expect(message_service.messages).to.include(message);
            done();
        });
        it('Should add a string message to the queue and return a unique id',(done) => {
            const message = "foo bar";
            const message_id = message_service.add_message(message);
            expect(validate_uuid(message_id)).to.be.true;
            expect(message_service.messages).to.include.key(message_id);
            expect(message_service.messages).to.include(message);
            done();
        });
    });

    describe('Read messages from queue',() => {
        const messages = [
            "message 1",
            {message: 2},
            "message 3"
        ];

        afterEach(() => {
            message_service.messages = new Map();
            message_service.processing = new Map();
            message_service.expirations = new Map();
        })

        it('Should read messages in the order they were added',(done) => {
            let ids = [];
            for(const message of messages) {
                ids.push(message_service.add_message(message));
            }
            for(const message of messages) {
                let read_message = message_service.get_next_message(1);
                expect(read_message).to.equal(message);
            }
            
            expect(message_service.messages).to.be.empty;
            expect(message_service.processing).to.have.property('size', 3);
            expect(message_service.processing).to.include.keys(ids);
            for(const message of messages) {
                expect(message_service.processing).to.include(message);
            }
            done();
        });

        it('Messages should be readded to the queue after the processing limit time',(done) => {
            let ids = [];
            for(const message of messages) {
                ids.push(message_service.add_message(message));
            }
            for(const message of messages) {
                let read_message = message_service.get_next_message(1);
                expect(read_message).to.equal(message);
            }
            
            expect(message_service.messages).to.be.empty;
            expect(message_service.processing).to.have.property('size', 3);
            expect(message_service.processing).to.include.keys(ids);
            for(const message of messages) {
                expect(message_service.processing).to.include(message);
            }
            setTimeout(() => {
                for(const message of messages) {
                    let read_message = message_service.get_next_message(1);
                    expect(read_message).to.equal(message);
                }
                expect(message_service.messages).to.be.empty;
                expect(message_service.processing).to.have.property('size', 3);
                expect(message_service.processing).to.include.keys(ids);
                for(const message of messages) {
                    expect(message_service.processing).to.include(message);
                }
                done();
            },1500)
        });
    });

    describe('End processing messages',() => {
        const messages = [
            "message 1",
            {message: 2},
            "message 3"
        ];

        it('Messages should be not readded to the queue when processes finnished',(done) => {
            let ids = [];
            for(const message of messages) {
                ids.push(message_service.add_message(message));
            }
            for(const message of messages) {
                message_service.get_next_message(1);
            }
            for(const id of ids) {
                expect(message_service.finnish_processing(id)).to.be.true;
            }
            setTimeout(() => {
                for(const message of messages) {
                    let read_message = message_service.get_next_message(1);
                    expect(read_message).to.be.null;
                }

                // console.log(message_service.messages)
                // console.log(message_service.processing)
                // console.log(message_service.expirations)

                expect(message_service.messages).to.be.empty;
                expect(message_service.processing).to.be.empty;
                expect(message_service.expirations).to.be.empty;
                done();
            },1500)
        })
    });
});