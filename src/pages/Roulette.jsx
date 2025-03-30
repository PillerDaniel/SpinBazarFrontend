import React from "react";

const ValueType = {
  NUMBER: "NUMBER",
  DOUBLE_SPLIT: "DOUBLE_SPLIT",
  QUAD_SPLIT: "QUAD_SPLIT",
  TRIPLE_SPLIT: "TRIPLE_SPLIT",
  EMPTY: "EMPTY",
  EVEN: "EVEN",
  ODD: "ODD",
  NUMBERS_1_18: "NUMBERS_1_18",
  NUMBERS_19_36: "NUMBERS_19_36",
  NUMBERS_1_12: "NUMBERS_1_12",
  NUMBERS_2_12: "NUMBERS_2_12",
  NUMBERS_3_12: "NUMBERS_3_12",
  RED: "RED",
  BLACK: "BLACK",
};

const rouletteWheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const Roulette = () => {
  const getRouletteColor = (number) => {
    const index = rouletteWheelNumbers.indexOf(number);
    const totalNumbers = 37;
    const i = index >= 0 ? index % totalNumbers : totalNumbers - Math.abs(index % totalNumbers);
    return i === 0 || number === null ? "none" : i % 2 === 0 ? "black" : "red";
  };

  const getClassNamesFromCellItemType = (type, number) => {
    const classes = ["border", "text-center", "p-2"];
    let isEvenOdd = 0;
    if (number != null && type === ValueType.NUMBER && number !== 0) {
      isEvenOdd = number % 2 === 0 ? 1 : 2;
    }

    if (type === ValueType.NUMBER) classes.push("bg-gray-200");
    if (type === ValueType.DOUBLE_SPLIT) classes.push("bg-yellow-200");
    if (type === ValueType.QUAD_SPLIT) classes.push("bg-green-200");
    if (type === ValueType.TRIPLE_SPLIT) classes.push("bg-blue-200");
    if (type === ValueType.EMPTY) classes.push("bg-gray-50");

    if (type === ValueType.EVEN || isEvenOdd === 1) classes.push("bg-gray-100");
    if (type === ValueType.ODD || isEvenOdd === 2) classes.push("bg-gray-300");

    if (
      type === ValueType.NUMBERS_1_18 ||
      (number !== null && number >= 1 && number <= 18 && type === ValueType.NUMBER)
    ) {
      classes.push("bg-purple-200");
    }

    if (
      type === ValueType.NUMBERS_19_36 ||
      (number !== null && number >= 19 && number <= 36 && type === ValueType.NUMBER)
    ) {
      classes.push("bg-purple-400");
    }

    if (
      type === ValueType.NUMBERS_1_12 ||
      (number !== null && number % 3 === 0 && type === ValueType.NUMBER && number !== 0)
    ) {
      classes.push("bg-indigo-200");
    }

    if (
      type === ValueType.NUMBERS_2_12 ||
      (number !== null && number % 3 === 2 && type === ValueType.NUMBER)
    ) {
      classes.push("bg-indigo-400");
    }

    if (
      type === ValueType.NUMBERS_3_12 ||
      (number !== null && number % 3 === 1 && type === ValueType.NUMBER)
    ) {
      classes.push("bg-indigo-600");
    }

    if (
      type === ValueType.RED ||
      (number !== null && getRouletteColor(number) === "red" && type === ValueType.NUMBER)
    ) {
      classes.push("text-red-500");
    }

    if (
      type === ValueType.BLACK ||
      (number !== null && getRouletteColor(number) === "black" && type === ValueType.NUMBER)
    ) {
      classes.push("text-black");
    }

    return classes.join(" ");
  };

  const generateNumbersList = () => {
    const colList = [];
    const difference = 3;

    for (let i = 1; i <= 5; i++) {
      const rowList = [];
      let startNumberSub = 0;
      if (i === 3) startNumberSub = 1;
      else if (i === 5) startNumberSub = 2;

      let nextStartNumberSub = 0;
      if (i + 1 === 3) nextStartNumberSub = 1;
      else if (i + 1 === 5) nextStartNumberSub = 2;

      let prevStartNumberSub = 0;
      if (i - 1 === 3) prevStartNumberSub = 1;
      else if (i - 1 === 5) prevStartNumberSub = 2;

      if (i === 1) {
        rowList.push({
          type: ValueType.NUMBER,
          value: 0,
        });
      }

      for (let j = 1; j <= 26; j++) {
        let cell = {};

        if (j > 24) {
          cell.type = ValueType.EMPTY;
          rowList.push(cell);
          continue;
        }

        if (i % 2 === 0) {
          if (j === 1) {
            const leftNumber = 0;
            const topNumber = difference - prevStartNumberSub;
            const bottomNumber = difference - nextStartNumberSub;

            cell.type = ValueType.TRIPLE_SPLIT;
            cell.valueSplit = [leftNumber, topNumber, bottomNumber];
            rowList.push(cell);
          } else {
            if (j % 2 === 0) {
              const topNumber = ((j - 2) / 2) * difference + difference - prevStartNumberSub;
              const bottomNumber = ((j - 2) / 2) * difference + difference - nextStartNumberSub;
              cell.type = ValueType.DOUBLE_SPLIT;
              cell.valueSplit = [topNumber, bottomNumber];
              rowList.push(cell);
            } else {
              const leftNumber = ((j - 1) / 2) * difference - prevStartNumberSub;
              const rightNumber = leftNumber + difference;
              const bottomLeftNumber = ((j - 1) / 2) * difference - nextStartNumberSub;
              const bottomRightNumber = bottomLeftNumber + difference;
              cell.type = ValueType.QUAD_SPLIT;
              cell.valueSplit = [leftNumber, rightNumber, bottomLeftNumber, bottomRightNumber];
              rowList.push(cell);
            }
          }
        } else {
          if (j === 1) {
            const leftNumber = 0;
            const rightNumber = leftNumber + difference;
            cell.type = ValueType.DOUBLE_SPLIT;
            cell.valueSplit = [leftNumber, rightNumber];
            rowList.push(cell);
          } else {
            if (j % 2 === 0) {
              const currentNumber = ((j - 2) / 2) * difference + difference - startNumberSub;
              cell.type = ValueType.NUMBER;
              cell.value = currentNumber;
              rowList.push(cell);
            } else {
              const leftNumber = ((j - 1) / 2) * difference - startNumberSub;
              const rightNumber = leftNumber + difference;
              cell.type = ValueType.DOUBLE_SPLIT;
              cell.valueSplit = [leftNumber, rightNumber];
              rowList.push(cell);
            }
          }
        }
      }
      colList.push(rowList);
    }

    return colList;
  };

  const renderCell = (cell, keyId) => {
    const cellClass = getClassNamesFromCellItemType(cell.type, cell.value);

    if (cell.type === ValueType.NUMBER && cell.value === 0) {
      return (
        <td key={`td_${cell.type}_${cell.value}`} className={cellClass} rowSpan={5}>
          0
        </td>
      );
    } else if (cell.type === ValueType.EMPTY) {
      return <td key={`empty_${keyId}`} className={cellClass}></td>;
    } else if (cell.type === ValueType.NUMBER) {
      return (
        <td key={`td_${cell.type}_${cell.value}`} className={cellClass}>
          {cell.value}
        </td>
      );
    } else {
      const splitValues = cell.valueSplit ? cell.valueSplit.join("/") : "";
      return (
        <td key={`td_${cell.type}_split_${splitValues}`} className={cellClass}></td>
      );
    }
  };

  const renderOptionCell = (type, text, span = 3) => {
    const cellClass = getClassNamesFromCellItemType(type, null);
    return (
      <>
        <td></td>
        <td className={cellClass} colSpan={span}>
          {text}
        </td>
      </>
    );
  };

  const numbers = generateNumbersList();

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse">
          <tbody>
            {numbers.map((row, rowIndex) => (
              <tr key={`tr_board_${rowIndex}`} className="border">
                {row.map((cell, cellIndex) =>
                  renderCell(cell, `${rowIndex}_${cellIndex}`)
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <table className="table-auto mt-4">
          <tbody>
            <tr>
              <td></td>
              <td className={getClassNamesFromCellItemType(ValueType.NUMBERS_1_12, null)} colSpan={7}>
                1st 12
              </td>
              <td></td>
              <td className={getClassNamesFromCellItemType(ValueType.NUMBERS_2_12, null)} colSpan={7}>
                2nd 12
              </td>
              <td></td>
              <td className={getClassNamesFromCellItemType(ValueType.NUMBERS_3_12, null)} colSpan={7}>
                3rd 12
              </td>
            </tr>
            <tr>
              <td></td>
              <td className={getClassNamesFromCellItemType(ValueType.NUMBERS_1_18, null)} colSpan={3}>
                1 to 18
              </td>
              <td></td>
              <td className={getClassNamesFromCellItemType(ValueType.EVEN, null)} colSpan={3}>
                EVEN
              </td>
              <td></td>
              <td className={getClassNamesFromCellItemType(ValueType.RED, null)} colSpan={1}></td>
              <td className={getClassNamesFromCellItemType(ValueType.BLACK, null)} colSpan={1}></td>
              <td></td>
              <td className={getClassNamesFromCellItemType(ValueType.ODD, null)} colSpan={3}>
                ODD
              </td>
              <td></td>
              <td className={getClassNamesFromCellItemType(ValueType.NUMBERS_19_36, null)} colSpan={3}>
                19 to 36
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Roulette;