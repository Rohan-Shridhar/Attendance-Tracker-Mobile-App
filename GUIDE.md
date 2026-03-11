# Attendance-Tracker-Mobile-App



React Native uses **JavaScript + React** to build mobile apps.

The easiest tool today: **Expo**. It removes most Android setup pain.

---

# 1. Install Required Tools

### 1️⃣ Install Node.js

Download and install:

* [https://nodejs.org](https://nodejs.org)

Check installation:

```bash
node -v
npm -v
```

---

### 2️⃣ Install Expo CLI

```bash
npm install -g expo-cli
```

Check:

```bash
expo --version
```

---

### 3️⃣ Install Expo Go (on your phone)

On your Android phone install the app:

* **Expo Go** from Play Store

This lets you run your app instantly.

---

# 2. Create Your React Native App

Open terminal and run:

```bash
npx create-expo-app myApp
```

Go inside the project:

```bash
cd myApp
```

Start the app:

```bash
npm start
```

This opens a **QR code in the browser**.

Scan it using **Expo Go**.

Your app runs instantly on your phone.

---

# 3. Understand the Project Structure

Inside your project:

```
myApp
 ├─ App.js
 ├─ package.json
 ├─ assets
 └─ node_modules
```

Main file:

```
App.js
```

---

# 4. Write Your First App

Open **App.js**

Replace code with this:

```javascript
import { Text, View, Button } from 'react-native';

export default function App() {
  return (
    <View style={{ 
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    }}>
      <Text>Hello MAD Lab 👋</Text>

      <Button
        title="Click Me"
        onPress={() => alert("Button pressed")}
      />
    </View>
  );
}
```

Save → phone reloads automatically.

---

# 5. Add More Screens (Example)

Install navigation:

```bash
npm install @react-navigation/native
```

(For labs you usually just need 2–3 screens.)

Example idea for lab:

**Simple To-Do App**

Features:

* Add task
* Delete task
* List tasks

If you want I can give you a **complete MAD-lab level project**.

---

# 6. Run on Android Emulator (optional)

Install:

* **Android Studio**
* Android Emulator

Then run:

```bash
npm run android
```

But honestly for labs **Expo Go is enough**.

---

# 7. Build APK (for submission)

Expo can generate APK.

Install EAS:

```bash
npm install -g eas-cli
```

Login:

```bash
eas login
```

Configure:

```bash
eas build:configure
```

Build APK:

```bash
eas build -p android --profile preview
```

After build finishes:

Expo gives a **download link for APK**.

Submit that in your lab.

---

# 8. Install APK on Phone

Download APK → install.

Your app works like a normal mobile app.

---


Just say **"give MAD lab project"** and I’ll build one for you.
