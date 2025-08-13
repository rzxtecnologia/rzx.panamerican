using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MauiRankingApp.Models;

namespace MauiRankingApp.ViewModels
{
    public class RankingPageViewModel
    {
        public ObservableCollection<Person> RankedPersons { get; set; }

        public RankingPageViewModel()
        {
            RankedPersons = new ObservableCollection<Person>();
            LoadRankingData();
        }

        private async void LoadRankingData()
        {
            var persons = await LoadPersonsFromJson();
            var rankedPersons = persons.OrderByDescending(p => p.Score).ToList();

            foreach (var person in rankedPersons)
            {
                RankedPersons.Add(person);
            }
        }

        private async Task<List<Person>> LoadPersonsFromJson()
        {
            var jsonFilePath = Path.Combine(FileSystem.AppDataDirectory, "Data", "persons.json");
            using var stream = await FileSystem.OpenAppPackageFileAsync(jsonFilePath);
            using var reader = new StreamReader(stream);
            var json = await reader.ReadToEndAsync();
            return JsonSerializer.Deserialize<List<Person>>(json);
        }
    }
}