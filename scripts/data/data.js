export function GetDoctors() {
  return mockDoctors;
}

export function GetServices() {
  return mockServices;
}

export function GetAppointments() {
  return mockAppointments;
}

export function GetAppointmentCalendar() {
  return mockCalendar;
}

export function GetAppointmentTimeSlots() {
  return mockTimeSlots;
}

const mockTimeSlots = [
  { time: "09:00", status: "disabled" },
  { time: "09:30", status: "disabled" },
  { time: "10:00", status: "available" },
  { time: "10:30", status: "available" },
  { time: "11:00", status: "available" },
  { time: "11:30", status: "available" },
  { time: "12:00", status: "available" },
  { time: "12:30", status: "available" },
  { time: "13:00", status: "available" },
  { time: "13:30", status: "disabled" },
  { time: "14:00", status: "selected" },
  { time: "14:30", status: "available" },
  { time: "15:00", status: "available" },
  { time: "15:30", status: "available" },
  { time: "16:00", status: "available" },
  { time: "16:30", status: "available" },
];

const mockDoctors = [
  { 
    id: 1, 
    fullName: "Константин Иванов", 
    spec: "Стоматолог-ортопед", 
    experience: 16, 
    services: ["Протезирование", "Виниры", "Коронки"], 
    nearest: ["Сегодня 14:00", "Завтра 16:00"]
  },
  { 
    id: 2, 
    fullName: "Анна Смирнова", 
    spec: "Стоматолог-терапевт", 
    experience: 8, 
    services: ["Лечение кариеса", "Эндодонтия", "Отбеливание"], 
    nearest: ["Завтра 10:00", "Четверг 12:30"]
  },
  { 
    id: 3, 
    fullName: "Сергей Дорохов", 
    spec: "Стоматолог-хирург", 
    experience: 12, 
    services: ["Удаление зубов", "Имплантация", "Пластика десны"], 
    nearest: ["Сегодня 18:00", "Пятница 11:00"]
  },
  { 
    id: 3, 
    fullName: "Сергей Дорохов", 
    spec: "Стоматолог-хирург", 
    experience: 12, 
    services: ["Удаление зубов", "Имплантация", "Пластика десны"], 
    nearest: ["Сегодня 18:00", "Пятница 11:00"]
  },
];

const mockServices = [
  {
    id: 1,
    title: "Первичная консультация",
    subtitle: "Осмотр, детальная диагностика и составление индивидуального плана лечения",
    duration: 45,
    price: 15000 
  },
  {
    id: 2,
    title: "Лечение кариеса",
    subtitle: "Удаление пораженных тканей, установка светоотверждаемой пломбы и полировка",
    duration: 60,
    price: 5500 
  },
  {
    id: 3,
    title: "Профессиональная гигиена",
    subtitle: "Ультразвуковая чистка, Air Flow, полировка пастой и фторирование",
    duration: 60,
    price: 4000 
  },
  {
    id: 4,
    title: "Сложное удаление зуба",
    subtitle: "Безболезненное удаление ретинированных зубов (в т.ч. зубов мудрости)",
    duration: 90,
    price: 8000 
  },
  {
    id: 4,
    title: "Сложное удаление зуба",
    subtitle: "Безболезненное удаление ретинированных зубов (в т.ч. зубов мудрости)",
    duration: 90,
    price: 8000 
  }
];

const mockAppointments = [
  {
    id: 1,
    num: 123,
    status: "Подтверждена",
    patientName: "Алексей Михайлов",
    service: {
      id: 3,
      title: "Профессиональная гигиена",
    },
    doctor: {
      id: 2,
      fullName: "Анна Смирнова",
    },
    date: "2026-05-15T14:00:00+03:00",
    duration: 60,
  },
  {
    id: 2,
    num: 124,
    status: "Ожидает",
    patientName: "Елена Смирнова",
    service: {
      id: 1,
      title: "Первичная консультация",
    },
    doctor: {
      id: 1,
      fullName: "Константин Иванов",
    },
    date: "2026-05-16T10:00:00+03:00",
    duration: 45,
  },
  {
    id: 3,
    num: 126,
    status: "Отменена",
    patientName: "Дмитрий Волков",
    service: {
      id: 4,
      title: "Сложное удаление зуба",
    },
    doctor: {
      id: 3,
      fullName: "Сергей Дорохов",
    },
    date: "2026-05-14T18:00:00+03:00",
    duration: 90,
  }
];

const mockCalendar = [
  {
    date: "2026-04-27",
    status: "disabled",
    text: "27",
  },
  {
    date: "2026-04-28",
    status: "disabled",
    text: "28",
  },
  {
    date: "2026-04-29",
    status: "disabled",
    text: "29",
  },
  {
    date: "2026-04-30",
    status: "disabled",
    text: "30",
  },
  {
    date: "2026-05-01",
    status: "disabled",
    text: "1",
  },
  {
    date: "2026-05-02",
    status: "disabled",
    text: "2",
  },
  {
    date: "2026-05-03",
    status: "disabled",
    text: "3",
  },
  {
    date: "2026-05-04",
    status: "disabled",
    text: "4",
  },
  {
    date: "2026-05-05",
    status: "disabled",
    text: "5",
  },
  {
    date: "2026-05-06",
    status: "disabled",
    text: "6",
  },
  {
    date: "2026-05-07",
    status: "disabled",
    text: "7",
  },
  {
    date: "2026-05-08",
    status: "disabled",
    text: "8",
  },
  {
    date: "2026-05-09",
    status: "disabled",
    text: "9",
  },
  {
    date: "2026-05-10",
    status: "disabled",
    text: "10",
  },
  {
    date: "2026-05-11",
    status: "disabled",
    text: "11",
  },
  {
    date: "2026-05-12",
    status: "disabled",
    text: "12",
  },
  {
    date: "2026-05-13",
    status: "disabled",
    text: "13",
  },
  {
    date: "2026-05-14",
    status: "disabled",
    text: "14",
  },
  {
    date: "2026-05-15",
    status: "disabled",
    text: "15",
  },
  {
    date: "2026-05-16",
    status: "disabled",
    text: "16",
  },
  {
    date: "2026-05-17",
    status: "disabled",
    text: "17",
  },
  {
    date: "2026-05-18",
    status: "disabled",
    text: "18",
  },
  {
    date: "2026-05-19",
    status: "disabled",
    text: "19",
  },
  {
    date: "2026-05-20",
    status: "selected",
    text: "20",
  },
  {
    date: "2026-05-21",
    status: "available",
    text: "21",
  },
  {
    date: "2026-05-22",
    status: "available",
    text: "22",
  },
  {
    date: "2026-05-23",
    status: "available",
    text: "23",
  },
  {
    date: "2026-05-24",
    status: "available",
    text: "24",
  },
  {
    date: "2026-05-25",
    status: "available",
    text: "25",
  },
  {
    date: "2026-05-26",
    status: "available",
    text: "26",
  },
  {
    date: "2026-05-27",
    status: "available",
    text: "27",
  },
  {
    date: "2026-05-28",
    status: "available",
    text: "28",
  },
  {
    date: "2026-05-29 ",
    status: "available",
    text: "29",
  },
  {
    date: "2026-05-30",
    status: "available",
    text: "30",
  },
  {
    date: "2026-05-31",
    status: "available",
    text: "31",
  },
];
