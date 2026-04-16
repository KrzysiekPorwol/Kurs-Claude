---
name: git-commit
description: 'Wykonuje git commit z analizą wiadomości zgodnie z konwencją Conventional Commits, inteligentnym dodawaniem do poczekalni (staging) i generowaniem treści. Używaj, gdy użytkownik prosi o zatwierdzenie zmian, utworzenie commita lub wspomina o "/commit". Obsługuje: (1) Automatyczne wykrywanie typu i zakresu na podstawie zmian, (2) Generowanie wiadomości z diffa, (3) Interaktywne zatwierdzanie z opcjonalnym nadpisaniem typu/zakresu/opisu, (4) Inteligentne grupowanie plików w poczekalni.'
license: MIT
allowed-tools: bash(*)
---

# Git Commit z Conventional Commits

## Przegląd

Twórz ustandaryzowane, semantyczne commity git przy użyciu specyfikacji Conventional Commits. Analizuj rzeczywiste różnice w kodzie (diff), aby określić odpowiedni typ, zakres i treść wiadomości.

## Format Conventional Commit

```
<typ>[opcjonalny zakres]: <opis>

[opcjonalna treść/body]

[opcjonalna stopka/footer(s)]
```

## Typy Commitów

| Typ        | Przeznaczenie                          |
| ---------- | -------------------------------------- |
| `feat`     | Nowa funkcjonalność                    |
| `fix`      | Naprawa błędu                          |
| `docs`     | Zmiany tylko w dokumentacji            |
| `style`    | Formatowanie/styl (brak zmian w logice)|
| `refactor` | Refaktoryzacja kodu (nie feat ani fix) |
| `perf`     | Poprawa wydajności                     |
| `test`     | Dodanie/aktualizacja testów            |
| `build`    | System budowania/zależności            |
| `ci`       | Zmiany w konfiguracji CI               |
| `chore`    | Prace porządkowe/różne                 |
| `revert`   | Wycofanie (revert) poprzedniego commita|

## Zmiany przełomowe (Breaking Changes)

```
# Wykrzyknik po typie/zakresie
feat!: usunięcie przestarzałego punktu końcowego (endpoint)

# Stopka BREAKING CHANGE
feat: pozwól konfiguracji rozszerzać inne konfiguracje

BREAKING CHANGE: zmieniono zachowanie klucza `extends`
```

## Cykl pracy

### 1. Analiza różnic (Diff)

```bash
# Jeśli pliki są w poczekalni, użyj staged diff
git diff --staged

# Jeśli nic nie jest w poczekalni, użyj diffa z drzewa roboczego
git diff

# Sprawdź również status
git status --porcelain
```

### 2. Dodawanie plików (jeśli potrzebne)

Jeśli poczekalnia jest pusta lub chcesz inaczej pogrupować zmiany:

```bash
# Dodaj konkretne pliki
git add sciezka/do/pliku1 sciezka/do/pliku2

# Dodaj wg wzorca
git add *.test.*
git add src/components/*

# Interaktywne dodawanie
git add -p
```

**Nigdy nie commituj sekretów** (.env, credentials.json, klucze prywatne).

### 3. Generowanie wiadomości commita

Przeanalizuj diff, aby określić:

- **Typ**: Jakiego rodzaju to zmiana?
- **Zakres**: Jaki obszar/moduł został zmodyfikowany?
- **Opis**: Jednoliniowe podsumowanie zmian (tryb rozkazujący, <72 znaki)

### 4. Wykonanie Commita

```bash
# Jednoliniowy
git commit -m "<typ>[zakres]: <opis>"

# Wieloliniowy z treścią i stopką
git commit -m "$(cat <<'EOF'
<typ>[zakres]: <opis>

<opcjonalna treść>

<opcjonalna stopka>
EOF
)"
```

## Najlepsze praktyki

- Jedna logiczna zmiana na jeden commit
- Tryb rozkazujący: "napraw błąd", a nie "naprawia błąd"
- Odnośniki do zgłoszeń: `Closes #123`, `Refs #456`
- Krótki opis poniżej 72 znaków

## Protokół bezpieczeństwa Git

- NIGDY nie aktualizuj konfiguracji git użytkownika
- NIGDY nie uruchamiaj destrukcyjnych komend (--force, hard reset) bez wyraźnej prośby
- NIGDY nie pomijaj hooków (--no-verify), chyba że użytkownik o to poprosi
- NIGDY nie wypychaj siłowo (force push) do gałęzi main/master
- Jeśli commit nie powiedzie się przez hooki, napraw błędy i stwórz NOWY commit (nie używaj amend)
