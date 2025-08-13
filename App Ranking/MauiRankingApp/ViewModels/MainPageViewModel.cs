using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MauiRankingApp.Models;

namespace MauiRankingApp.ViewModels
{
    public class MainPageViewModel
    {
        public ObservableCollection<Person> Persons { get; set; }

        public MainPageViewModel()
        {
            Persons = new ObservableCollection<Person>();
            LoadPersons();
        }

        private async void LoadPersons()
        {
            var personsData = await LoadJsonDataAsync("Data/persons.json");
            if (personsData != null)
            {
                foreach (var person in personsData.OrderByDescending(p => p.Score))
                {
                    Persons.Add(person);
                }
            }
        }

        private async Task<List<Person>> LoadJsonDataAsync(string filePath)
        {
            try
            {
                using (var stream = await FileSystem.OpenAppPackageFileAsync(filePath))
                using (var reader = new StreamReader(stream))
                {
                    var json = await reader.ReadToEndAsync();
                    return JsonSerializer.Deserialize<List<Person>>(json);
                }
            }
            catch
            {
                return null;
            }
        }
    }
}