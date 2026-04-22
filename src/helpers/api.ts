import type { ClientResponseError } from "pocketbase";

export const extract_message = (data: ClientResponseError) => {
  const data_keys = Object.keys(data.data);
  console.log({ ...data }, "data");

  if (data_keys.length < 1) {
    //@ts-ignore
    return data.cause["message"];
  }
  const error_object = data.data.data;
  if (!data.data) {
    return data.message;
  }
  const keys = Object.keys(error_object);
  let messages = "";
  for (const key of keys) {
    const value = error_object[key].message;
    messages += `${key}: ${value}\n`;
  }
  if (keys.length > 0) {
    return messages;
  }
  const api_error = data.response?.data?.message;
  if (!api_error) {
    return data.message;
  }
  return api_error;
};
