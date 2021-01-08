from drf_base64.serializers import ModelSerializer


class DynamicFieldsModelSerializer(ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super(DynamicFieldsModelSerializer, self).__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class DynamicReadOnlyFieldsModelSerializer(DynamicFieldsModelSerializer):
    def __init__(self, *args, **kwargs):
        read_only_fields = kwargs.pop('read_only_fields', None)

        super(DynamicReadOnlyFieldsModelSerializer, self).__init__(*args, **kwargs)

        if read_only_fields is not None:
            for field_name in self.fields:
                if field_name in read_only_fields:
                    self.fields[field_name].read_only = True
