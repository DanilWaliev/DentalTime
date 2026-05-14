
export function GetDoctors() {
  return mockDoctors
}

export function GetServices() {
  return mockServices
}

export function GetAppointments() {
  return mockAppointments
}

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
  }
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
  }
];

const mockAppointments = [
  {
    id: 1,
    num: 123,
    status: "Подтверждена",
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
    num: 125,
    status: "Отменена",
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