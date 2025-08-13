# MauiRankingApp

## Overview
MauiRankingApp is a .NET MAUI application that displays a ranking of individuals based on their scores. The application retrieves data from a JSON file and presents it in a user-friendly interface.

## Project Structure
The project consists of the following key components:

- **Models**
  - `Person.cs`: Defines the `Person` class representing an individual with properties such as `Name` and `Score`.

- **Views**
  - `MainPage.xaml`: The main page layout and UI elements for the application.
  - `RankingPage.xaml`: The layout for the ranking page, displaying the ranked list of persons.

- **ViewModels**
  - `MainPageViewModel.cs`: Manages data and logic for the main page.
  - `RankingPageViewModel.cs`: Loads data from `persons.json` and provides it to the ranking view.

- **Data**
  - `persons.json`: Contains the JSON data representing the list of persons, including their names and scores.

- **App Files**
  - `App.xaml`: Defines application-level resources and styles.
  - `App.xaml.cs`: Contains the application startup logic.
  - `MauiProgram.cs`: Entry point for the MAUI application, configuring services and setting up the app.

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the project in your preferred IDE.
3. Restore the project dependencies.
4. Run the application on your desired platform (iOS, Android, Windows).

## Features
- Displays a ranked list of persons based on their scores.
- User-friendly interface with easy navigation between the main page and ranking page.

## Future Enhancements
- Implement user input for adding new persons and scores.
- Add sorting options for the ranking list.
- Enhance UI with additional styling and animations.