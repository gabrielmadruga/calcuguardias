import _ from "lodash";
import moment from "moment";

// const feriados = [
//   {
//     name: "Declaratoria de la Independencia.",
//     date: moment("2020-08-25"),
//   },
//   {
//     name: "Descubrimiento de América / Día de la Raza.",
//     date: moment("2020-10-12"),
//   },
//   {
//     name: "Día de los Difuntos.",
//     date: moment("2020-11-02"),
//   },
//   {
//     name: "Navidad o Día de la Familia.",
//     date: moment("2020-12-25"),
//   },
// ];

// const nightShiftBonus = 1.1;
// const nightShiftFirstHour = 23;
// const nightShiftLastHour = 6;
// const weekendBonus = 1.1;
// const feriadoBonus = 1.1;

// const feriadoBonuses = _.map(feriados, (f) =>
//   createSpecificDayBonus(feriadoBonus, f.date)
// );

// const bonuses = _.concat(
//   [
//     createTimeOfDayBonus(
//       nightShiftBonus,
//       nightShiftFirstHour,
//       nightShiftLastHour
//     ),
//     createWeekendBonus(weekendBonus),
//   ],
//   feriadoBonuses
// );

function applyBonus(predicate, value, bonus, isAdditive) {
  if (predicate) {
    if (isAdditive) return value + bonus;
    else return value * bonus;
  } else {
    return value;
  }
}

function createDayTimeIntervalBonus(bonus, fromMoment, toMoment, isAdditive) {
  return function dayTimeIntervalBonus(moment, value) {
    return applyBonus(
      moment.isBetween(fromMoment, toMoment, "days", "[)"),
      value,
      bonus,
      isAdditive
    );
  };
}

function createTimeOfDayBonus(bonus, fromHour, toHour, isAdditive) {
  return function dayTimeIntervalBonus(moment, value) {
    return createDayTimeIntervalBonus(
      bonus,
      moment.clone().hours(fromHour),
      moment.clone().hours(toHour < fromHour ? 24 + toHour : toHour),
      isAdditive
    )(moment, value);
  };
}

function createWeekendBonus(bonus, isAdditive) {
  return function weekendBonus(moment, value) {
    // Sunday is 0 and Saturday is 6
    return applyBonus(
      moment.day() === 6 || moment.day() === 0,
      value,
      bonus,
      isAdditive
    );
  };
}

function createSpecificDayBonus(bonus, dayMoment, isAdditive) {
  return function specificDayBonus(moment, value) {
    return applyBonus(
      moment.isSame(dayMoment, "day"),
      value,
      bonus,
      isAdditive
    );
  };
}

function momentEarnings(moment, hourValue, bonuses) {
  return _.reduce(
    bonuses,
    (acc, bonus) => {
      return bonus(moment, acc);
    },
    hourValue
  );
}

function worktimeEarnings(worktime, hours, bonuses) {
  const startDateTime = moment(worktime.fields.startDateTime.value);
  const duration = worktime.fields.duration.value;
  const moments = _.map(_.range(0, duration), (offset) =>
    startDateTime.clone().add(offset, "hour")
  );
  const hour = _.find(hours, (h) => h.id === worktime.fields.hour.value);

  return _.reduce(
    moments,
    (acc, currMoment) =>
      acc +
      momentEarnings(currMoment, hour ? hour.fields.value.value : 0, bonuses),
    0
  );
}

function parseBonuses(bonuses) {
  return _.map(bonuses, (bonus) => {
    const isTimeOfDayBonus = bonus.fields.type.selectedOption === 0;
    const isSpecificDayBonus = bonus.fields.type.selectedOption === 1;
    const isAdditive = bonus.fields.valueType.selectedOption === 0;
    const value = bonus.fields.value.value;
    if (isTimeOfDayBonus) {
      return createTimeOfDayBonus(
        value,
        bonus.fields.startHour.value,
        bonus.fields.endHour.value,
        isAdditive
      );
    } else if (isSpecificDayBonus) {
      return createSpecificDayBonus(
        value,
        moment(bonus.fields.day.value),
        isAdditive
      );
    } else {
      return createWeekendBonus(value, isAdditive);
    }
  });
}

export function monthEarnings(month, worktimes, hours, bonuses) {
  const thisMonthWorktimes = _.filter(worktimes, (worktime) => {
    const startDateTime = moment(worktime.fields.startDateTime.value);
    return moment().month(month).isSame(startDateTime, "month");
  });

  return _.reduce(
    thisMonthWorktimes,
    (acc, currWorktime) =>
      acc + worktimeEarnings(currWorktime, hours, parseBonuses(bonuses)),
    0
  );
}
