(function () {
  function Message($http) {
    const messages = [];

    function getMessages() {
      return $http.get('/api/message')
        .then(res => {
          this.messages = res.data;
          return this.messages;
        });
    }

    function postMessage(message) {
      return $http.post('/api/message/', { message })
        .then(res => {
          this.messages.push(res.data.message);
          return res.data.message;
        });
    }

    return {
      messages,
      getMessages,
      postMessage,
    };
  }
  angular.module('faster')
    .factory('Message', Message);
}());
