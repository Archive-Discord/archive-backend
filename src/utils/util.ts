import { ArchvieUserFlags } from "@/interfaces/users.interface";

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  } else {
    return false;
  }
};

export function checkUserFlag(base: number, required: number | keyof typeof ArchvieUserFlags):boolean {
	return checkFlag(base, typeof required === 'number' ? required : ArchvieUserFlags[required])
}

function checkFlag(base: number, required: number) {
	return (base & required) === required
}
