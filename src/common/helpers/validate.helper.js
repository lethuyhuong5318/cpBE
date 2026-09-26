import { BadRequestException } from "./exception.helper.js";

export const parseId = (value, fieldName = "id") => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new BadRequestException(`${fieldName} không hợp lệ`);
  }
  return id;
};

export const requireString = (value, fieldName, maxLength = 255) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new BadRequestException(`Vui lòng nhập ${fieldName}`);
  }
  if (value.trim().length > maxLength) {
    throw new BadRequestException(`${fieldName} tối đa ${maxLength} ký tự`);
  }
  return value.trim();
};

export const optionalString = (value, fieldName, maxLength = 255) => {
  if (value === undefined) return undefined;
  if (value === null || (typeof value === "string" && value.trim() === "")) {
    return null;
  }
  if (typeof value !== "string") {
    throw new BadRequestException(`${fieldName} phải là chuỗi`);
  }
  if (value.trim().length > maxLength) {
    throw new BadRequestException(`${fieldName} tối đa ${maxLength} ký tự`);
  }
  return value.trim();
};

export const optionalUrl = (value, fieldName) => {
  const url = optionalString(value, fieldName, 500);
  if (url && !/^https?:\/\/\S+$/i.test(url)) {
    throw new BadRequestException(`${fieldName} phải là đường dẫn http(s)`);
  }
  return url;
};

export const parseAge = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const age = Number(value);
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    throw new BadRequestException("Tuổi (tuoi) phải là số nguyên từ 1 đến 120");
  }
  return age;
};

export const isEmail =(email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
