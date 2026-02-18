// Definisikan nama file di paling atas agar bisa diakses semua fungsi
const FILE_NAME = "notes.txt"
const newNote = "This is a new note.happy coding!\n";

// 1. fungsi untuk menulis catatan ke dalam file
async function addNote(content: string) {
  try {
    const file = Bun.file(FILE_NAME);
    
    // Ambil isi lama jika ada
    const existingContent = await file.exists() ? await file.text() : "";
    
    // Tambahkan catatan baru (UBAH FORMAT TIMESTAMP DISINI)
    // toISOString() menghasilkan format: 2026-02-12T14:33:20.000Z
    // replace('T', ' ') mengubah huruf T menjadi spasi
    // substring(0, 19) mengambil 19 karakter pertama agar menjadi: 2026-02-12 14:33:20
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const formattedNote = `[${timestamp}] ${content}\n`;
    
    // Simpan kembali
    await Bun.write(FILE_NAME, existingContent + formattedNote);
    
    console.log("✅ Catatan berhasil disimpan!");
  } catch (error) {
    console.error("❌ Gagal menyimpan catatan:", error);
  }
}

// 2. Fungsi untuk membaca semua catatan
async function readNotes() {
  const file = Bun.file(FILE_NAME);
  if (await file.exists()) {
    const content = await file.text();
    console.log("\n--- DAFTAR CATATAN ---");
    // Menampilkan nomor baris agar mudah untuk dihapus nanti
    const lines = content.trim().split("\n");
    lines.forEach((line, index) => {
      console.log(`${index + 1}. ${line}`);
    });
  } else {
    console.log("\n📭 Belum ada catatan tersimpan.");
  }
}

// 3. Fungsi untuk menghapus catatan berdasarkan nomor baris
async function deleteNote(lineNumber: number) {
  try {
    const file = Bun.file(FILE_NAME);
    if (!(await file.exists())) return;

    const content = await file.text();
    const lines = content.trim().split("\n");

    if (lineNumber > 0 && lineNumber <= lines.length) {
      const removed = lines.splice(lineNumber - 1, 1);
      // Simpan kembali sisa barisnya, jangan lupa tambahkan newline di akhir
      await Bun.write(FILE_NAME, lines.join("\n") + (lines.length > 0 ? "\n" : ""));
      console.log(`🗑️ Berhasil menghapus: ${removed}`);
    } else {
      console.log("❌ Nomor catatan tidak valid!");
    }
  } catch (error) {
    console.error("❌ Gagal menghapus catatan:", error);
  }
}

// 4. Fungsi untuk mencari catatan (FITUR SEARCH BARU)
async function searchNotes(keyword: string) {
  try {
    const file = Bun.file(FILE_NAME);
    if (await file.exists()) {
      const content = await file.text();
      // Pisahkan setiap baris
      const lines = content.trim().split("\n");
      
      // Filter catatan yang mengandung keyword (dibuat toLowerCase agar case-insensitive)
      const filteredLines = lines.filter(line => 
        line.toLowerCase().includes(keyword.toLowerCase())
      );

      if (filteredLines.length > 0) {
        console.log(`\n--- HASIL PENCARIAN: "${keyword}" ---`);
        filteredLines.forEach(line => console.log(line));
      } else {
        console.log(`\n📭 Tidak ditemukan catatan dengan kata: "${keyword}"`);
      }
    } else {
      console.log("\n📭 Belum ada catatan tersimpan.");
    }
  } catch (error) {
    console.error("❌ Gagal mencari catatan:", error);
  }
}

// 5. Fungsi untuk mengupdate/mengubah catatan
async function updateNote(lineNumber: number, newContent: string) {
  try {
    const file = Bun.file(FILE_NAME);
    if (!(await file.exists())) return;

    const content = await file.text();
    const lines = content.trim().split("\n");

    if (lineNumber > 0 && lineNumber <= lines.length) {
      // Buat timestamp baru untuk update
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const formattedNote = `[${timestamp}] ${newContent}`;
      
      // Ganti baris yang lama dengan yang baru
      lines[lineNumber - 1] = formattedNote;
      
      // Simpan kembali ke file
      await Bun.write(FILE_NAME, lines.join("\n") + "\n");
      console.log(`✅ Berhasil mengubah catatan nomor ${lineNumber}`);
    } else {
      console.log("❌ Nomor catatan tidak valid!");
    }
  } catch (error) {
    console.error("❌ Gagal mengupdate catatan:", error);
  }
}

// Ambil input dari terminal: bun run index.ts "isi catatan"
const command = Bun.argv[2]; 
const value = Bun.argv[3];

if (command === "delete") {
  if (value) {
    const indexToDelete = parseInt(value);
    if (!isNaN(indexToDelete)) {
      await deleteNote(indexToDelete);
    } else {
      console.log("❌ Error: Harap masukkan angka.");
    }
  } else {
    console.log("⚠️ Masukkan nomor baris. Contoh: bun run index.ts delete 1");
  }
} 
else if (command === "list" || command === "view") {
  await readNotes();
} 
// TAMBAHAN LOGIKA UNTUK SEARCH:
else if (command === "search") {
  if (value) {
    await searchNotes(value);
  } else {
    console.log("⚠️ Masukkan kata kunci pencarian. Contoh: bun run index.ts search coding");
  }
}
else if (command) {
  // Jika argumen bukan 'delete', 'list', atau 'search', maka dianggap menambah catatan
  await addNote(command);
  await readNotes(); // Tampilkan list setelah menambah
} 

else if (command === "update") {
  const newContent = Bun.argv[4]; // Mengambil argumen ke-4 (isi teks baru)
  if (value && newContent) {
    const indexToUpdate = parseInt(value);
    if (!isNaN(indexToUpdate)) {
      await updateNote(indexToUpdate, newContent);
    } else {
      console.log("❌ Error: Harap masukkan angka untuk nomor baris.");
    }
  } else {
    console.log("⚠️ Format salah. Contoh: bun run index.ts update 1 \"Isi catatan baru\"");
  }
}

else {
  console.log("💡 Tips:");
  console.log("   Lihat Semua : bun run index.ts list");
  console.log("   Tambah      : bun run index.ts \"isi catatan\"");
  console.log("   Hapus       : bun run index.ts delete [nomor]");
  console.log("   Cari        : bun run index.ts search [kata_kunci]");
}