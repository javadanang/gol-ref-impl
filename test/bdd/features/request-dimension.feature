
Feature: Client request dimension

  Scenario: Client uses socket.io-client to request dimension
    When I send a dimension request to websocket service
    Then a dimension of board are 180 cols and 108 rows
