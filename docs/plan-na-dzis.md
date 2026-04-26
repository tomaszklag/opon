Zapisz tą regułę w dokumentacji aby była respektowana podczas dalszych prac

Jest jakiś mądry pattern na obsługę formualarzy? Może logikę zarządzana formuarzem warto byłoby mieć gdzieś oddzielnie a tylko użyć w tym komponencie?

Może podielisz ten page na mniejsze komponenty? Nie chę mieć jednego dużego page. Lepiej mieć podział na mniejsze komponenty a page tylko to skleja

Wszytskie ikonki svg jakie się pojawiają przenieśmy do oddzielnych plików. Nie ma sensu ich trzymać w page lub komponentach. Dużo linijek kodu zajmują i zmniejszają czytelność

Dlaczego nie użyłeś PhoneInput z DS Components? Jeśli jest inny to może trzba go poprawićw DS? To samo z pozostałymi komponentami. Masz przecież w design spisane jakie komponenty DS powinny zostać użyte (sekcja DS Components na dole w design). Jak czegoś brakuje albo nie działa to dodaj/zmodyfikuj w bilbiotece DS

Co z teym co zaplanowaliśmy w design: "Stany inputu telefonu". Mam wrażenie żenie jest to respektowane.

Co z tym co zaplanowaliśmy w design: "Flow & security". Musimy to zaimplementować. Moze zróbmy krok po kroku bo jest tam sporo logiki której ejszcze nie mamy

Co to za kolory w panel.css powinno to być raczej w design system
