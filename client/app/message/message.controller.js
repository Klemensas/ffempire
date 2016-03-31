(function () {
  class MessageController {
    constructor(Message) {
      this.windowActive = false;
      this.Message = Message;

      this.messages = [];

      this.Message.getMessages()
        .then(m => {
          this.messages = m;
        });
    }

    toggleChat() {
      this.windowActive = !this.windowActive;
    }

    postMessage(form) {
      if (form.$valid) {
        this.Message.postMessage(this.chatMessage.content)
          .then((msg) => {
            this.chatMessage.content = '';
          })
          .catch(() => {
            // TODO: handle messag error
            // form.password.$setValidity('mongoose', false);
            // this.errors.other = 'Incorrect password';
            // this.message = '';
          });
      }
    }
  }

  angular.module('faster')
    .controller('MessageController', MessageController);
}());
