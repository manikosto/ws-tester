"""Tests for JSON Schema validation functionality."""

import json
import os

import pytest
import jsonschema


# ===== Unit Tests: Schema Validation =====

class TestSchemaValidation:
    """Test JSON Schema validation logic."""

    def setup_method(self):
        self.schema = {
            "type": "object",
            "properties": {
                "type": {"type": "string"},
                "payload": {"type": "object"},
                "timestamp": {"type": "number"},
            },
            "required": ["type", "payload"],
        }

    def test_valid_message(self):
        """Test that a valid message passes validation."""
        data = {"type": "event", "payload": {"key": "value"}}
        jsonschema.validate(instance=data, schema=self.schema)

    def test_valid_message_with_optional_field(self):
        """Test that a valid message with optional fields passes."""
        data = {"type": "event", "payload": {"key": "value"}, "timestamp": 1234567890}
        jsonschema.validate(instance=data, schema=self.schema)

    def test_missing_required_field(self):
        """Test that a message missing required fields fails."""
        data = {"type": "event"}  # missing 'payload'
        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(instance=data, schema=self.schema)

    def test_wrong_type(self):
        """Test that wrong types fail validation."""
        data = {"type": 123, "payload": {}}  # type should be string
        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(instance=data, schema=self.schema)

    def test_payload_wrong_type(self):
        """Test that payload with wrong type fails."""
        data = {"type": "event", "payload": "not-an-object"}
        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(instance=data, schema=self.schema)

    def test_empty_object(self):
        """Test that an empty object fails (missing required fields)."""
        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(instance={}, schema=self.schema)

    def test_additional_properties_allowed(self):
        """Test that additional properties are allowed by default."""
        data = {"type": "event", "payload": {}, "extra": "field"}
        jsonschema.validate(instance=data, schema=self.schema)

    def test_nested_object_validation(self):
        """Test validation of nested objects."""
        schema = {
            "type": "object",
            "properties": {
                "user": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "age": {"type": "integer", "minimum": 0},
                    },
                    "required": ["name"],
                }
            },
            "required": ["user"],
        }
        valid = {"user": {"name": "Alice", "age": 30}}
        jsonschema.validate(instance=valid, schema=schema)

        invalid = {"user": {"age": -1}}
        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(instance=invalid, schema=schema)

    def test_array_validation(self):
        """Test validation of array fields."""
        schema = {
            "type": "object",
            "properties": {
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 1,
                }
            },
            "required": ["tags"],
        }
        valid = {"tags": ["ws", "test"]}
        jsonschema.validate(instance=valid, schema=schema)

        empty_array = {"tags": []}
        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(instance=empty_array, schema=schema)

    def test_enum_validation(self):
        """Test validation of enum fields."""
        schema = {
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["open", "closed", "error"]}
            },
            "required": ["status"],
        }
        valid = {"status": "open"}
        jsonschema.validate(instance=valid, schema=schema)

        invalid = {"status": "unknown"}
        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(instance=invalid, schema=schema)

    def test_pattern_validation(self):
        """Test regex pattern validation."""
        schema = {
            "type": "object",
            "properties": {
                "id": {"type": "string", "pattern": "^[a-f0-9]{8}$"}
            },
            "required": ["id"],
        }
        valid = {"id": "abcdef01"}
        jsonschema.validate(instance=valid, schema=schema)

        invalid = {"id": "not-a-hex"}
        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(instance=invalid, schema=schema)


# ===== File-based Schema Validation =====

class TestSchemaFileValidation:
    """Test schema validation using files (simulating CLI validate command)."""

    def test_validate_file_valid(self, tmp_dir):
        """Test validating a data file against a schema file."""
        schema = {
            "type": "object",
            "properties": {"name": {"type": "string"}},
            "required": ["name"],
        }
        data = {"name": "test"}

        schema_path = os.path.join(tmp_dir, "schema.json")
        data_path = os.path.join(tmp_dir, "data.json")

        with open(schema_path, "w") as f:
            json.dump(schema, f)
        with open(data_path, "w") as f:
            json.dump(data, f)

        with open(schema_path) as f:
            loaded_schema = json.load(f)
        with open(data_path) as f:
            loaded_data = json.load(f)

        jsonschema.validate(instance=loaded_data, schema=loaded_schema)

    def test_validate_file_invalid(self, tmp_dir):
        """Test that invalid data file fails validation."""
        schema = {
            "type": "object",
            "properties": {"name": {"type": "string"}},
            "required": ["name"],
        }
        data = {"name": 123}  # wrong type

        schema_path = os.path.join(tmp_dir, "schema.json")
        data_path = os.path.join(tmp_dir, "data.json")

        with open(schema_path, "w") as f:
            json.dump(schema, f)
        with open(data_path, "w") as f:
            json.dump(data, f)

        with open(schema_path) as f:
            loaded_schema = json.load(f)
        with open(data_path) as f:
            loaded_data = json.load(f)

        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(instance=loaded_data, schema=loaded_schema)

    def test_validate_malformed_json(self, tmp_dir):
        """Test that malformed JSON data fails."""
        data_path = os.path.join(tmp_dir, "bad.json")
        with open(data_path, "w") as f:
            f.write("{not valid json")

        with open(data_path) as f:
            with pytest.raises(json.JSONDecodeError):
                json.load(f)


# ===== WebSocket + Schema Validation Integration =====

@pytest.mark.asyncio
async def test_ws_schema_validation_valid(schema_server):
    """Test sending a schema-valid message to the validating server."""
    import websockets

    async with websockets.connect(schema_server.url) as ws:
        msg = json.dumps({"type": "event", "payload": {"key": "value"}})
        await ws.send(msg)
        resp = json.loads(await ws.recv())
        assert resp["valid"] is True


@pytest.mark.asyncio
async def test_ws_schema_validation_invalid(schema_server):
    """Test sending a schema-invalid message to the validating server."""
    import websockets

    async with websockets.connect(schema_server.url) as ws:
        msg = json.dumps({"wrong": "structure"})
        await ws.send(msg)
        resp = json.loads(await ws.recv())
        assert resp["valid"] is False
        assert "error" in resp


@pytest.mark.asyncio
async def test_ws_schema_validation_not_json(schema_server):
    """Test sending non-JSON to the validating server."""
    import websockets

    async with websockets.connect(schema_server.url) as ws:
        await ws.send("this is not json")
        resp = json.loads(await ws.recv())
        assert resp["valid"] is False
