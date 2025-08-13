using System;

namespace MauiRankingApp.Models
{
    public class Person
    {
        public string Name { get; set; }
        public int Score { get; set; }

        public Person(string name, int score)
        {
            Name = name;
            Score = score;
        }

        public override string ToString()
        {
            return $"{Name}: {Score}";
        }
    }
}