/* jshint browser:true */

describe('GoAngular.Model', function() {

  'use strict';

  var require = window.require;
  var assert = window.assert;
  var sinon = window.sinon;

  /* Component Dependencies */
  var Model = require('goangular/lib/model');
  var KeyModel = require('goangular/lib/key_model');
  var UsersModel = require('goangular/lib/users_model');
  var QueryModel = require('goangular/lib/query_model');

  var sandbox;
  var fakeRoom;
  var fakeKey;
  var fakeSync;
  var fakeConn;
  var fakePromise;
  var initialize;

  before(function() {
    sandbox = sinon.sandbox.create();
    fakeRoom = createFakeRoom('lobby');
    fakeKey = createFakeKey('fakeKey');

    fakePromise = {
      then: function(cb) { cb(); return fakePromise; },
      fail: sandbox.stub()
    };

    initialize = sandbox.stub();

    fakeConn = { $ready: sinon.stub().returns(fakePromise) };
    fakeSync = {
      $initialize: initialize
    };
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('initialization', function() {
    var model;

    describe('base model', function() {

      beforeEach(function() {
        model = new Model(fakeConn, fakeKey, fakeSync, Model);
      });

      describe('$sync', function() {

        it('delegates to sync object', function() {
          model.$sync();

          sinon.assert.calledWith(initialize, model);
        });
      });

      describe('$key', function() {

        it('creates a new instance of model', function() {
          model.$key('keyName');

          sinon.assert.calledWith(fakeKey.key, 'keyName');
        });
      });

      describe('$on', function() {

        it('add an event listener', function() {
          var fakeLstner = sinon.stub();

          model.$on('set', fakeLstner);

          sinon.assert.calledWith(fakeKey.on, 'set', fakeLstner);
        });

        it('add an event listener with options object', function() {
          var fakeOpts = {
            local: true
          };

          var fakeLstner = sinon.stub();

          model.$on('leave', fakeOpts, fakeLstner);

          sinon.assert.calledWith(fakeRoom.on, 'leave', fakeOpts, fakeLstner);
        });
      });

      describe('$off', function() {

        it('remove an event listener', function() {
          var fakeLstner = sinon.stub();

          model.$off('add', fakeLstner);

          sinon.assert.calledWith(fakeKey.off, 'add', fakeLstner);
        });

        it('remove an event listener with options object', function() {
          var fakeOpts = {
            bubble: true
          };

          var fakeLstner = sinon.stub();

          model.$off('remove', fakeOpts, fakeLstner);

          sinon.assert.calledWith(fakeKey.off, 'remove', fakeOpts, fakeLstner);
        });
      });

      describe('$omit', function() {

        it('returns an object sans $-prefixed properties', function() {
          var result = model.$omit();

          assert.deepEqual(result, {});
        });
      });
    });

    describe('key model', function() {
      var keyModel;

      beforeEach(function() {
        keyModel = new KeyModel(fakeConn, fakeKey, fakeSync, Model);
      });

      describe('$set', function() {

        it('sets the value of the key', function() {
          keyModel.$set('foo');

          sinon.assert.calledWith(fakeKey.set, 'foo');
        });
      });

      describe('$add', function() {

        it('sets the value of the key', function() {
          keyModel.$add('foo');

          sinon.assert.calledWith(fakeKey.add, 'foo');
        });
      });

      describe('$remove', function() {

        it('removes a key', function() {
          keyModel.$remove();

          sinon.assert.calledOnce(fakeKey.remove);
        });
      });
    });

    describe('users model', function() {
      var usersModel;

      beforeEach(function() {
        usersModel = new UsersModel(fakeConn, fakeKey, fakeSync, Model);
      });

      describe('$self', function() {

        it('uses the local user\'s key to create a new model', function() {

        });
      });

      describe('$getUser', function() {

        it('uses the passed id to create a new model', function() {

        });
      });
    });

    describe('query model', function() {
      var queryModel;

      beforeEach(function() {
        queryModel = new QueryModel(fakeConn, fakeKey, fakeSync, Model);
      });

      describe('$$index', function() {

        it('initializes $$index as an empty array', function() {
          assert.equal(queryModel.$$index.length, 0);
        });
      });
    });
  });

  function createFakeKey(name) {
    var fakeKey = {
      name: name,
      room: sinon.stub().returns(fakeRoom),
      set: sandbox.stub(),
      add: sandbox.stub(),
      remove: sandbox.stub(),
      on: sandbox.stub(),
      off: sandbox.stub()
    };

    fakeKey.key = sinon.spy(function() { return fakeKey; });

    return fakeKey;
  }

  function createFakeRoom(name) {
    return {
      name: name,
      on: sandbox.stub(),
      off: sandbox.stub(),
      join: sandbox.stub(),
      leave: sandbox.stub(),
      users: createFakeKey('.users')
    };
  }
});
