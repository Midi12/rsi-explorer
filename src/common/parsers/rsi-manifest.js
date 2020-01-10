// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      define(['kaitai-struct/KaitaiStream'], factory);
    } else if (typeof module === 'object' && module.exports) {
      module.exports = factory(require('kaitai-struct/KaitaiStream'));
    } else {
      root.RsiManifest = factory(root.KaitaiStream);
    }
  }(this, function (KaitaiStream) {
  var RsiManifest = (function() {
    function RsiManifest(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
  
      this._read();
    }
    RsiManifest.prototype._read = function() {
      this.header = new Header(this._io, this, this._root);
      this._raw_stringNodes = this._io.readBytes(this.header.firstRecordOffset);
      var _io__raw_stringNodes = new KaitaiStream(this._raw_stringNodes);
      this.stringNodes = new StringNodes(_io__raw_stringNodes, this, this._root);
      this.indexRecords = new Array(this.header.numRecords);
      for (var i = 0; i < this.header.numRecords; i++) {
        this.indexRecords[i] = new IndexRecord(this._io, this, this._root);
      }
    }
  
    var Header = RsiManifest.Header = (function() {
      function Header(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Header.prototype._read = function() {
        this.magic = this._io.ensureFixedContents([80, 52, 75, 45, 77, 65, 78, 73]);
        this.unknown08 = this._io.readU4le();
        this.unknown0c = this._io.readU4le();
        this.headerSize = this._io.readU8le();
        this.firstRecordOffset = this._io.readU8le();
        this.numRecords = this._io.readU8le();
      }
  
      return Header;
    })();
  
    var IndexRecord = RsiManifest.IndexRecord = (function() {
      function IndexRecord(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      IndexRecord.prototype._read = function() {
        this.id = this._io.readS4le();
        this.unknownValue0 = this._io.readU4le();
        this.unknownValue1 = this._io.readU4le();
        this.sha256 = this._io.readBytes(32);
        this.compressionMethod = this._io.readU8le();
        this.compressedSize = this._io.readU8le();
        this.uncompressedSize = this._io.readU8le();
        this.crc32 = this._io.readU4le();
        this.signature = this._io.readBytes(128);
        this.unknownValue2 = this._io.readU4le();
      }
  
      return IndexRecord;
    })();
  
    var StringNode = RsiManifest.StringNode = (function() {
      function StringNode(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      StringNode.prototype._read = function() {
        this.index = this._io.readS4le();
        this.length = this._io.readU2le();
        this.unknown06 = this._io.readU2le();
        this.childOffset = this._io.readS4le();
        this.nextOffset = this._io.readS4le();
        this.data = KaitaiStream.bytesToStr(this._io.readBytes(this.length), "ascii");
      }
      Object.defineProperty(StringNode.prototype, 'child', {
        get: function() {
          if (this._m_child !== undefined)
            return this._m_child;
          if (this.childOffset != -1) {
            var io = this._io;
            var _pos = io.pos;
            io.seek(this.childOffset);
            this._m_child = new StringNode(io, this, this._root);
            io.seek(_pos);
          }
          return this._m_child;
        }
      });
      Object.defineProperty(StringNode.prototype, 'next', {
        get: function() {
          if (this._m_next !== undefined)
            return this._m_next;
          if (this.nextOffset != -1) {
            var io = this._io;
            var _pos = io.pos;
            io.seek(this.nextOffset);
            this._m_next = new StringNode(io, this, this._root);
            io.seek(_pos);
          }
          return this._m_next;
        }
      });
  
      return StringNode;
    })();
  
    var StringNodes = RsiManifest.StringNodes = (function() {
      function StringNodes(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      StringNodes.prototype._read = function() {
        this.root = new StringNode(this._io, this, this._root);
      }
  
      return StringNodes;
    })();
  
    return RsiManifest;
  })();
  return RsiManifest;
  }));
  