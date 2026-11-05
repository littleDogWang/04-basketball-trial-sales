// Public reference only. Keep private records, live inventory and business actions out of this module.
export const SCENARIO_KNOWLEDGE = {
  "source": {
    "kind": "Fictional course reference",
    "revision": "2026-11-05",
    "scope": "Course-fit and preparation guidance only; no real sessions, vacancies, fees or enrollment are represented."
  },
  "timeZone": "America/Chicago",
  "course": {
    "title": "Beginner trial class",
    "location": "Austin, TX, United States",
    "minAge": 8,
    "maxAge": 12,
    "experience": "No prior basketball experience required",
    "durationMinutes": 60,
    "goals": [
      "Basic ball control and passing",
      "Simple movement and team play",
      "A supportive first experience without competitive selection"
    ]
  },
  "lesson": [
    {
      "minutes": 10,
      "activity": "Warm-up and simple movement games"
    },
    {
      "minutes": 15,
      "activity": "Ball handling and dribbling"
    },
    {
      "minutes": 15,
      "activity": "Passing and partner practice"
    },
    {
      "minutes": 15,
      "activity": "Small-sided games adapted to beginners"
    },
    {
      "minutes": 5,
      "activity": "Cool-down and a short reflection"
    }
  ],
  "preparation": {
    "bring": [
      "Comfortable athletic clothing",
      "Closed-toe athletic shoes",
      "Water"
    ],
    "provided": "Basketballs for the lesson are supplied in this example.",
    "parentObservation": "A parent may observe the example trial from the designated viewing area; no parent participation is required."
  },
  "commonConcerns": {
    "shyChild": "The example class starts with simple games and partner practice. Discuss what would help the child feel comfortable; do not guarantee how they will feel.",
    "noExperience": "The trial starts with basics and does not require a tryout or a skill test.",
    "commitment": "Discuss a trial as an opportunity to see whether the child enjoys the activity; do not imply enrollment or a payment obligation.",
    "outsideAgeRange": "Only the eight-to-twelve beginner course is defined. Do not invent an exception or a second course."
  },
  "unconfirmed": [
    "Actual dates and times",
    "Current fees or discounts",
    "Places available",
    "Staffing and any individual accommodation"
  ]
} as const;
