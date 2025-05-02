// import * as moment from 'moment-timezone';

// declare global {
//   interface Date {
//     toLocalTime(): string;
//   }
// }

// Date.prototype.toLocalTime = function (): string {
//   return moment(this).tz('Asia/Tehran').format('YYYY-MM-DDTHH:mm:ss.SSSSSSSZ');
// };

// export {};

declare global {
  interface Date {
    toLocalTehranTime(): string;
  }
}

Date.prototype.toLocalTehranTime = function (): string {
  // Tehran timezone is UTC+3:30 (or +4:30 during daylight saving time)
  const tehranOffset = 3.5 * 60 * 60 * 1000; // 3.5 hours in milliseconds
  const localTime = new Date(this.getTime() + tehranOffset);

  const year = localTime.getFullYear();
  const month = (localTime.getMonth() + 1).toString().padStart(2, '0');
  const day = localTime.getDate().toString().padStart(2, '0');
  const hours = localTime.getHours().toString().padStart(2, '0');
  const minutes = localTime.getMinutes().toString().padStart(2, '0');
  const seconds = localTime.getSeconds().toString().padStart(2, '0');
  const milliseconds = localTime.getMilliseconds().toString().padStart(3, '0');

  // Return in format "YYYY-MM-DDTHH:mm:ss.SSS"
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export {};
