import React, { useState } from "react";
// python {
// import { decamelizeKeys } from "humps";
// } python
import { JSONSchema7 } from "json-schema";
import { Form } from "@rjsf/bootstrap-4";
// graphql {
import { gql, useMutation } from "@apollo/client";

import {
  EntityRequest,
  EntityResponse,
} from "../../APIClients/EntityAPIClient";
// } graphql
// rest {
import EntityAPIClient, {
  EntityRequest,
  EntityResponse,
} from "../../APIClients/EntityAPIClient";
// } rest

const schema: JSONSchema7 = {
  title: "Update Entity",
  description: "A simple form to test updating an entity",
  type: "object",
  required: [
    "id",
    "stringField",
    "intField",
    "stringArrayField",
    "enumField",
    "boolField",
  ],
  properties: {
    id: {
      type: "string",
      title: "entity id",
      default: "123abc456def7890ghij1234",
    },
    stringField: {
      type: "string",
      title: "String Field",
      default: "UW Blueprint",
    },
    intField: {
      type: "integer",
      title: "Integer Field",
      default: 2017,
    },
    stringArrayField: {
      type: "array",
      items: {
        type: "string",
      },
      title: "String Array Field",
      default: [],
    },
    enumField: {
      type: "string",
      enum: ["A", "B", "C", "D"],
      title: "Enum Field",
      default: "A",
    },
    boolField: {
      type: "boolean",
      title: "Boolean Field",
      default: true,
    },
  },
};

const uiSchema = {
  boolField: {
    "ui:widget": "select",
  },
};

// graphql {
// no-file-storage {
const UPDATE_ENTITY = gql`
  mutation UpdateForm_UpdateEntity($id: ID!, $entity: EntityRequestDTO!) {
    updateEntity(id: $id, entity: $entity) {
      id
      stringField
      intField
      enumField
      stringArrayField
      boolField
    }
  }
`;
// } no-file-storage
// file-storage {
const UPDATE_ENTITY = gql`
  mutation UpdateForm_UpdateEntity(
    $id: ID!
    $entity: EntityRequestDTO!
    $file: Upload
  ) {
    updateEntity(id: $id, entity: $entity, file: $file) {
      id
      stringField
      intField
      enumField
      stringArrayField
      boolField
      fileName
    }
  }
`;
// } file-storage

// } graphql
const UpdateForm = (): React.ReactElement => {
  const [data, setData] = useState<EntityResponse | null>(null);
  // file-storage {
  const [fileField, setFileField] = useState<File | null>(null);
  // } file-storage
  const [formFields, setFormFields] = useState<EntityRequest | null>(null);

  // graphql {
  const [updateEntity] = useMutation<{ updateEntity: EntityResponse }>(
    UPDATE_ENTITY,
  );

  // } graphql
  if (data) {
    return <p>Updated! ✔️</p>;
  }

  // file-storage {
  const fileChanged = (e: { target: HTMLInputElement }) => {
    if (e.target.files) {
      const fileSize = e.target.files[0].size / 1024 / 1024;
      if (fileSize > 5) {
        // eslint-disable-next-line no-alert
        window.alert("Your file exceeds 5MB. Upload a smaller file.");
      } else {
        setFileField(e.target.files[0]);
      }
    }
  };

  // } file-storage
  const onSubmit = async ({ formData }: { formData: EntityResponse }) => {
    const { id, ...entityData } = formData;

    // graphql {
    // no-file-storage {
    const graphQLResult = await updateEntity({
      variables: { id: formData.id, entity: entityData as EntityRequest },
    });
    // } no-file-storage
    // file-storage {
    const graphQLResult = await updateEntity({
      variables: {
        id: formData.id,
        entity: entityData as EntityRequest,
        file: fileField,
      },
    });
    // } file-storage
    const result: EntityResponse | null =
      graphQLResult.data?.updateEntity ?? null;
    // } graphql
    // rest {
    // no-file-storage {
    const result = await EntityAPIClient.update(formData.id, { entityData });
    // } no-file-storage
    // file-storage {
    const multipartFormData = new FormData();
    // typescript {
    multipartFormData.append("body", JSON.stringify(entityData));
    // } typescript
    // python {
    multipartFormData.append("body", JSON.stringify(decamelizeKeys(entityData)));
    // } python
    if (fileField) {
      multipartFormData.append("file", fileField);
    }
    const result = await EntityAPIClient.update(
      formData.id,
      { entityData: multipartFormData }
    );
    // } file-storage
    // } rest
    setData(result);
  };
  // no-file-storage {
  return (
    <Form
      formData={formFields}
      schema={schema}
      uiSchema={uiSchema}
      onChange={({ formData }: { formData: EntityRequest }) =>
        setFormFields(formData)
      }
      onSubmit={onSubmit}
    />
  );
  // } no-file-storage
  // file-storage {
  return (
    <>
      <input type="file" onChange={fileChanged} />
      <Form
        formData={formFields}
        schema={schema}
        uiSchema={uiSchema}
        onChange={({ formData }: { formData: EntityRequest }) =>
          setFormFields(formData)
        }
        onSubmit={onSubmit}
      />
    </>
  );
  // } file-storage
};

export default UpdateForm;
