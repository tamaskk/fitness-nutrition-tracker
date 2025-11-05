# Flutter Frontend Communication Guide

## Complete Flow for Flutter/Dart

---

## Data Models

First, create the data models:

```dart
// lib/models/chat_message.dart
class ChatMessage {
  final String role; // 'user' or 'assistant'
  final String content;
  final String timestamp;

  ChatMessage({
    required this.role,
    required this.content,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() {
    return {
      'role': role,
      'content': content,
      'timestamp': timestamp,
    };
  }

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      role: json['role'] as String,
      content: json['content'] as String,
      timestamp: json['timestamp'] as String,
    );
  }
}

// lib/models/chat_response.dart
class ChatResponse {
  final bool success;
  final String category;
  final String? responseType;
  final bool? needsMoreInfo;
  final String? pendingCategory;
  final String response;
  final List<ChatMessage> conversationHistory;
  final String timestamp;
  final int messageCount;

  ChatResponse({
    required this.success,
    required this.category,
    this.responseType,
    this.needsMoreInfo,
    this.pendingCategory,
    required this.response,
    required this.conversationHistory,
    required this.timestamp,
    required this.messageCount,
  });

  factory ChatResponse.fromJson(Map<String, dynamic> json) {
    var historyList = json['conversationHistory'] as List;
    List<ChatMessage> history = historyList
        .map((msg) => ChatMessage.fromJson(msg))
        .toList();

    return ChatResponse(
      success: json['success'] as bool,
      category: json['category'] as String,
      responseType: json['responseType'] as String?,
      needsMoreInfo: json['needsMoreInfo'] as bool?,
      pendingCategory: json['pendingCategory'] as String?,
      response: json['response'] as String,
      conversationHistory: history,
      timestamp: json['timestamp'] as String,
      messageCount: json['messageCount'] as int,
    );
  }
}
```

---

## API Service

Create the API service:

```dart
// lib/services/fitness_chat_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/chat_message.dart';
import '../models/chat_response.dart';

class FitnessChatService {
  final String baseUrl = 'https://your-api-url.com';
  
  Future<ChatResponse> sendMessage({
    required String message,
    required List<ChatMessage> conversationHistory,
  }) async {
    final url = Uri.parse('$baseUrl/api/fitness/chat');
    
    final body = jsonEncode({
      'message': message,
      'conversationHistory': conversationHistory.map((msg) => msg.toJson()).toList(),
    });

    print('Sending message: $message');
    print('History length: ${conversationHistory.length}');

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print('Received responseType: ${data['responseType']}');
      print('New history length: ${data['messageCount']}');
      return ChatResponse.fromJson(data);
    } else {
      throw Exception('Failed to send message: ${response.statusCode}');
    }
  }
}
```

---

## State Management (Provider)

Using Provider for state management:

```dart
// lib/providers/training_chat_provider.dart
import 'package:flutter/material.dart';
import '../models/chat_message.dart';
import '../models/chat_response.dart';
import '../services/fitness_chat_service.dart';

enum TrainingStep {
  initial,
  selectingMuscles,
  selectingExerciseCount,
  complete,
}

class TrainingChatProvider extends ChangeNotifier {
  final FitnessChatService _chatService = FitnessChatService();
  
  List<ChatMessage> _conversationHistory = [];
  TrainingStep _currentStep = TrainingStep.initial;
  bool _isLoading = false;
  String? _errorMessage;

  List<ChatMessage> get conversationHistory => _conversationHistory;
  TrainingStep get currentStep => _currentStep;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Step 1: Start training plan creation
  Future<void> startTrainingPlan() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _chatService.sendMessage(
        message: 'Create a workout plan',
        conversationHistory: _conversationHistory,
      );

      // Save conversation history
      _conversationHistory = response.conversationHistory;

      // Check response type
      if (response.responseType == 'muscleGroup') {
        _currentStep = TrainingStep.selectingMuscles;
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Step 2: Send selected muscle groups
  Future<void> selectMuscleGroups(List<String> muscles) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Format message
      final message = 'I want to train: ${muscles.join(', ')}';

      final response = await _chatService.sendMessage(
        message: message,
        conversationHistory: _conversationHistory,
      );

      // Save updated conversation history
      _conversationHistory = response.conversationHistory;

      // Check response type
      if (response.responseType == 'exerciseNumber') {
        _currentStep = TrainingStep.selectingExerciseCount;
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Step 3: Send selected exercise count
  Future<void> selectExerciseCount(int count) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Format message
      final message = '$count exercises per muscle group';

      final response = await _chatService.sendMessage(
        message: message,
        conversationHistory: _conversationHistory,
      );

      // Save updated conversation history
      _conversationHistory = response.conversationHistory;

      // Check if training is complete
      if (response.category == 'training' && response.responseType == null) {
        _currentStep = TrainingStep.complete;
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Extract training details from conversation
  Map<String, dynamic> getTrainingDetails() {
    List<String> muscleGroups = [];
    int exercisesPerMuscle = 0;

    // Find muscle group message
    for (var msg in _conversationHistory) {
      if (msg.role == 'user' && msg.content.contains('want to train')) {
        final parts = msg.content.split(':');
        if (parts.length > 1) {
          muscleGroups = parts[1]
              .split(',')
              .map((m) => m.trim())
              .where((m) => m.isNotEmpty)
              .toList();
        }
      }

      // Find exercise count message
      if (msg.role == 'user' && msg.content.contains('exercises')) {
        final match = RegExp(r'\d+').firstMatch(msg.content);
        if (match != null) {
          exercisesPerMuscle = int.parse(match.group(0)!);
        }
      }
    }

    return {
      'muscleGroups': muscleGroups,
      'exercisesPerMuscle': exercisesPerMuscle,
    };
  }

  void reset() {
    _conversationHistory = [];
    _currentStep = TrainingStep.initial;
    _isLoading = false;
    _errorMessage = null;
    notifyListeners();
  }
}
```

---

## UI Screens

### Main Training Chat Screen

```dart
// lib/screens/training_chat_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/training_chat_provider.dart';
import '../widgets/muscle_group_selector.dart';
import '../widgets/exercise_count_selector.dart';

class TrainingChatScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create Training Plan'),
      ),
      body: Consumer<TrainingChatProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return Center(child: CircularProgressIndicator());
          }

          if (provider.errorMessage != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: ${provider.errorMessage}'),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: provider.reset,
                    child: Text('Try Again'),
                  ),
                ],
              ),
            );
          }

          switch (provider.currentStep) {
            case TrainingStep.initial:
              return _buildInitialScreen(context, provider);
            
            case TrainingStep.selectingMuscles:
              return MuscleGroupSelector(
                onSelect: (muscles) {
                  provider.selectMuscleGroups(muscles);
                },
              );
            
            case TrainingStep.selectingExerciseCount:
              return ExerciseCountSelector(
                onSelect: (count) {
                  provider.selectExerciseCount(count);
                },
              );
            
            case TrainingStep.complete:
              // Automatically navigate to training screen
              WidgetsBinding.instance.addPostFrameCallback((_) {
                final details = provider.getTrainingDetails();
                Navigator.pushNamed(
                  context,
                  '/training',
                  arguments: details,
                );
              });
              return Center(child: Text('Redirecting...'));
          }
        },
      ),
    );
  }

  Widget _buildInitialScreen(BuildContext context, TrainingChatProvider provider) {
    return Center(
      child: ElevatedButton(
        onPressed: () {
          provider.startTrainingPlan();
        },
        child: Text('Create Workout Plan'),
      ),
    );
  }
}
```

---

### Muscle Group Selector Widget

```dart
// lib/widgets/muscle_group_selector.dart
import 'package:flutter/material.dart';

class MuscleGroupSelector extends StatefulWidget {
  final Function(List<String>) onSelect;

  MuscleGroupSelector({required this.onSelect});

  @override
  _MuscleGroupSelectorState createState() => _MuscleGroupSelectorState();
}

class _MuscleGroupSelectorState extends State<MuscleGroupSelector> {
  final List<Map<String, String>> muscleGroups = [
    {'id': 'Chest', 'label': 'Chest', 'labelHU': 'Mell', 'icon': '💪'},
    {'id': 'Back', 'label': 'Back', 'labelHU': 'Hát', 'icon': '🏋️'},
    {'id': 'Legs', 'label': 'Legs', 'labelHU': 'Láb', 'icon': '🦵'},
    {'id': 'Shoulders', 'label': 'Shoulders', 'labelHU': 'Váll', 'icon': '💪'},
    {'id': 'Arms', 'label': 'Arms', 'labelHU': 'Kar', 'icon': '💪'},
    {'id': 'Abs', 'label': 'Abs', 'labelHU': 'Has', 'icon': '🎯'},
    {'id': 'Full Body', 'label': 'Full Body', 'labelHU': 'Teljes test', 'icon': '🔥'},
  ];

  final Set<String> selectedMuscles = {};

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Which muscle groups do you want to focus on?',
            style: Theme.of(context).textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 8),
          Text(
            'Select one or more',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 24),
          Expanded(
            child: GridView.builder(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.5,
              ),
              itemCount: muscleGroups.length,
              itemBuilder: (context, index) {
                final muscle = muscleGroups[index];
                final isSelected = selectedMuscles.contains(muscle['id']);

                return InkWell(
                  onTap: () {
                    setState(() {
                      if (isSelected) {
                        selectedMuscles.remove(muscle['id']);
                      } else {
                        selectedMuscles.add(muscle['id']!);
                      }
                    });
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.blue : Colors.grey[200],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? Colors.blue : Colors.grey,
                        width: 2,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          muscle['icon']!,
                          style: TextStyle(fontSize: 32),
                        ),
                        SizedBox(height: 8),
                        Text(
                          muscle['label']!,
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.black87,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: selectedMuscles.isEmpty
                ? null
                : () {
                    widget.onSelect(selectedMuscles.toList());
                  },
            child: Text('Continue'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

### Exercise Count Selector Widget

```dart
// lib/widgets/exercise_count_selector.dart
import 'package:flutter/material.dart';

class ExerciseCountSelector extends StatelessWidget {
  final Function(int) onSelect;

  ExerciseCountSelector({required this.onSelect});

  final List<Map<String, dynamic>> exerciseCounts = [
    {'value': 2, 'label': '2 exercises', 'desc': 'Quick workout'},
    {'value': 3, 'label': '3 exercises', 'desc': 'Balanced'},
    {'value': 4, 'label': '4 exercises', 'desc': 'Comprehensive'},
    {'value': 5, 'label': '5 exercises', 'desc': 'Intense'},
    {'value': 6, 'label': '6 exercises', 'desc': 'Maximum volume'},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'How many exercises per muscle group?',
            style: Theme.of(context).textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 24),
          Expanded(
            child: ListView.builder(
              itemCount: exerciseCounts.length,
              itemBuilder: (context, index) {
                final option = exerciseCounts[index];
                
                return Card(
                  margin: EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    onTap: () {
                      onSelect(option['value'] as int);
                    },
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: Colors.blue,
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                '${option['value']}',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                          SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  option['label'] as String,
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  option['desc'] as String,
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.arrow_forward_ios),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## Main App Setup

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/training_chat_provider.dart';
import 'screens/training_chat_screen.dart';
import 'screens/training_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => TrainingChatProvider()),
      ],
      child: MaterialApp(
        title: 'Fitness App',
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        initialRoute: '/',
        routes: {
          '/': (context) => TrainingChatScreen(),
          '/training': (context) => TrainingScreen(),
        },
      ),
    );
  }
}
```

---

## Training Screen (Result)

```dart
// lib/screens/training_screen.dart
import 'package:flutter/material.dart';

class TrainingScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final details = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final muscleGroups = details['muscleGroups'] as List<String>;
    final exercisesPerMuscle = details['exercisesPerMuscle'] as int;

    return Scaffold(
      appBar: AppBar(
        title: Text('Your Training Plan'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Training Plan Details',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            SizedBox(height: 24),
            Text(
              'Muscle Groups:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: muscleGroups.map((muscle) {
                return Chip(label: Text(muscle));
              }).toList(),
            ),
            SizedBox(height: 24),
            Text(
              'Exercises per muscle group:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            SizedBox(height: 8),
            Text(
              '$exercisesPerMuscle exercises',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                // Generate workout plan based on details
                print('Generating workout for: $muscleGroups');
                print('With $exercisesPerMuscle exercises per muscle');
              },
              child: Text('Generate Workout Plan'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 16),
                minimumSize: Size(double.infinity, 0),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  provider: ^6.1.1
```

---

## Quick Summary

### The Flow:

1. **User taps "Create Workout Plan"**
   - Calls `provider.startTrainingPlan()`
   - Receives `responseType: "muscleGroup"`
   - Shows muscle group selector

2. **User selects muscles (e.g., Chest, Back, Shoulders)**
   - Calls `provider.selectMuscleGroups(['Chest', 'Back', 'Shoulders'])`
   - Sends: `"I want to train: Chest, Back, Shoulders"`
   - Receives `responseType: "exerciseNumber"`
   - Shows exercise count selector

3. **User selects exercise count (e.g., 4)**
   - Calls `provider.selectExerciseCount(4)`
   - Sends: `"4 exercises per muscle group"`
   - Receives `category: "training"`
   - Navigates to training screen with details

### Key Points:

✅ Provider handles all conversation history automatically
✅ Each method sends the current history and updates it
✅ UI automatically switches based on `currentStep`
✅ Details extracted from conversation history at the end

That's it! The Provider pattern handles all the state management and history tracking for you. 🎯

