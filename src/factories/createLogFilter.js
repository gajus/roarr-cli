// @flow

import split from 'split2';
import {
  matchObject,
} from 'searchjs';
import {
  formatInvalidInputMessage,
  isRoarrLine,
} from '../utilities';
import type {
  LogFilterConfigurationType,
} from '../types';

export default (configuration: LogFilterConfigurationType) => {
  let lastLinePrinterLinesAgo = 0;
  let printNextLines = 0;
  let buffer = [];

  const filterLog = (line: string) => {
    
    const subject = JSON.parse(line);
    let isSubject = configuration.filterFunction(subject)
    
    if(isSubject && !(isSubject===true || isSubject===false)){
      line = JSON.stringify(isSubject); 
    }
    
    buffer.push(line);
    
    buffer = buffer.slice(-1 * configuration.lag - 1);

    let result;

    if (
      configuration.filterExpression && matchObject(subject, configuration.filterExpression) ||
      configuration.filterFunction && isSubject
    ) {
      result = buffer.slice(-1 * lastLinePrinterLinesAgo - 1, -1).join('\n') + '\n' + line.trim();

      lastLinePrinterLinesAgo = 0;
      printNextLines = configuration.head;
    } else {
      printNextLines--;

      if (printNextLines >= 0) {
        result = line + '\n';
      } else {
        result = '';
      }

      lastLinePrinterLinesAgo++;
    }

    return result ? result.trim() + '\n' : '';
  };

  return split((line) => {
    if (!isRoarrLine(line)) {
      return line + '\n';
    }

    try {
      return filterLog(line);
    } catch (error) {
      return formatInvalidInputMessage(configuration.chalk, error, line);
    }
  });
};
