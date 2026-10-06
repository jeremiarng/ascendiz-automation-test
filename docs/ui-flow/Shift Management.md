# Test Flow Documentation: Shift Management

**Module Links :**

- [https\://staging.zappy.my.id/work-schedules](https://staging.zappy.my.id/work-schedules)  
- [https\://staging.zappy.my.id/shift-templates](https://staging.zappy.my.id/shift-templates)   
- [https\://staging.zappy.my.id/all-shifts](https://staging.zappy.my.id/all-shifts)   
- [https\://staging.zappy.my.id/all-shift-request-history](https://staging.zappy.my.id/all-shift-request-history)

## Flow ID: SM-ST-001

* **Name :** Membuat shift template baru dengan valid value  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Template  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat membuat shift template baru dengan mengisi seluruh field yang diperlukan  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih Shift Template  
2. Anda akan diredirect ke https\://staging.zappy.my.id/shift-templates  
3. Pada laman shift template list, tekan tombol Add Shift Template yang ada di bagian ujung atas  
4. Kemudian, akan muncul pop up form untuk create shift, silahkan isi seluruh field yang diperlukan. Sangat disarankan untuk eksplorasi field dan pilihannya di form ini.  
5. Jika sudah tekan tombol Create di form bawah ujung kanan  
6. Jika sudah berhasil, seharusnya anda akan di redirect ke halaman Shift Template List lagi dan data shift template terbaru harusnya muncul pada tabel tersebut  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: SM-ST-002

* **Name :** Membuat shift template baru dengan beberapa field mandatory kosong  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Template  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User tidak dapat membuat shift template baru tanpa mengisi seluruh field yang diperlukan.  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih Shift Template  
2. Anda akan diredirect ke [https\://staging.zappy.my.id/shift-templates](https://staging.zappy.my.id/shift-templates)  
3. Pada laman shift template list, tekan tombol Add Shift Template yang ada di bagian ujung atas  
4. Kemudian, akan muncul pop up form untuk create shift, silahkan isi beberapa field dan kosongkan field mandatory seperti name  
5. Jika sudah tekan tombol Create di form bawah ujung kanan  
6. Seharusnya akan muncul pesan error pada field mandatory yang kosong  
* **Verification Points :**   
- Muncul pesan error berwarna merah dibawah field mandatory kosong.

—

## Flow ID: SM-ST-003

* **Name :** Membuat shift template baru dengan start time lebih besar dari end time  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Template  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User tidak dapat membuat shift template dengan end time yang lebih dahulu dibandingkan start time.  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih Shift Template  
2. Anda akan diredirect ke [https\://staging.zappy.my.id/shift-templates](https://staging.zappy.my.id/shift-templates)  
3. Pada laman shift template list, tekan tombol Add Shift Template yang ada di bagian ujung atas  
4. Kemudian, akan muncul pop up form untuk create shift, silahkan isi beberapa field yang diperlukan.  
5. Centang required clock in / out, lalu isi start time lebih besar dibandingkan dengan end time.  
6. Jika sudah tekan tombol Create di form bawah ujung kanan  
7. Seharusnya akan muncul pesan error  
* **Verification Points :**   
- Muncul pesan error berwarna merah di paling atas.

—

## Flow ID: SM-ST-004

* **Name :** Membuat shift template baru dengan break time yang tidak berada di range jam kerja  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Template  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User tidak dapat membuat shift template dengan break time yang tidak berada pada range jam kerja.  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih Shift Template  
2. Anda akan diredirect ke [https\://staging.zappy.my.id/shift-templates](https://staging.zappy.my.id/shift-templates)  
3. Pada laman shift template list, tekan tombol Add Shift Template yang ada di bagian ujung atas  
4. Kemudian, akan muncul pop up form untuk create shift, silahkan isi beberapa field yang diperlukan.  
5. Centang required clock in / out, lalu isi start time dan end timenya.  
6. Centang required break in / out, lalu isi break start time dan break end time dengan jam yang tidak berada di range start time dan end timenya.  
7. Jika sudah tekan tombol Create di form bawah ujung kanan  
8. Seharusnya akan muncul pesan error  
* **Verification Points :**   
- Muncul pesan error berwarna merah di paling atas.

—

## Flow ID: SM-ST-005

* **Name :** Membuat shift template baru dengan break time yang tidak sama dengan start time dan end time  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Template  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User tidak dapat membuat shift template dengan break time yang tidak sama dengan start time dan end time.  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih Shift Template  
2. Anda akan diredirect ke [https\://staging.zappy.my.id/shift-templates](https://staging.zappy.my.id/shift-templates)  
3. Pada laman shift template list, tekan tombol Add Shift Template yang ada di bagian ujung atas  
4. Kemudian, akan muncul pop up form untuk create shift, silahkan isi beberapa field yang diperlukan.  
5. Centang required clock in / out, lalu isi start time dan end timenya.  
6. Centang required break in / out, lalu isi break start time dan break end time sama dengan jam start dan end timenya.  
7. Jika sudah tekan tombol Create di form bawah ujung kanan  
8. Seharusnya akan muncul pesan error  
* **Verification Points :**   
- Muncul pesan error berwarna merah di paling atas.

—

## Flow ID: SM-ST-006

* **Name :** Menghapus shift template yang sudah ada di sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Template  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat menghapus shift template yang sudah ada di sistem.  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih Shift Template  
2. Anda akan diredirect ke [https\://staging.zappy.my.id/shift-templates](https://staging.zappy.my.id/shift-templates)  
3. Pada laman shift template list, cari row shift template yang sudah berhasil dibuat  
4. Lalu, di paling kanan tekan tombol delete (icon trash bin) untuk shift template tersebut  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: SM-ST-007

* **Name :** Melakukan edit pada shift template yang sudah ada di sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Template  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat melakukan edit shift template yang sudah ada di sistem  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih Shift Template  
2. Anda akan diredirect ke https\://staging.zappy.my.id/shift-templates  
3. Cari shift template yang baru saja dibuat di flow sebelumnya (bisa melakukan fitur search di bagian atas) pada tabel  
4. Kemudian, geser ke paling kanan dan tekan tombol pensil di row data tersebut  
5. Maka akan muncul pop up edit form yang sama seperti create form di awal  
6. Silahkan edit sesuai keinginan dan jika sudah aman tekan tombol Save  
7. Cari kembali data shift template yang baru saja di edit di tabel Shift Template List dan crosscheck apakah datanya sudah sesuai dengan apa yang baru saja diedit  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: SM-ST-008

* **Name :** Menonaktifkan shift template yang sudah ada di sistem.  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Template  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat menonaktifkan shift template yang sudah ada di sistem  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih Shift Template  
2. Anda akan diredirect ke https\://staging.zappy.my.id/shift-templates  
3. Cari shift template yang baru saja dibuat di flow sebelumnya (bisa melakukan fitur search di bagian atas) pada tabel  
4. Kemudian, geser ke paling kanan dan tekan tombol pensil di row data tersebut  
5. Maka akan muncul pop up edit form yang sama seperti create form di awal  
6. Silahkan edit statusnya menjadi inactive  
7. Jika sudah aman tekan tombol Save  
8. Cari kembali data shift template yang baru saja di edit di tabel Shift Template List dan cross check apakah datanya sudah inaktif.  
9. Kemudian, buka All Shift Schedule di bagian navbar atau akses melalui {base\_url}/all-shifts  
10. Tekan tombol “Create Work Schedule” yang berada di ujung kanan atas  
11. Setelah ditekan, maka akan muncul pop up form pembuatan schedule baru  
12. Pilih schedule type “Shift Template”, lalu pada field shift template coba analisis isi dropdownnya dan periksa apakah shift template yang sudah dinonaktifkan masih muncul pada dropdown atau tidak  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website  
- Shift template yang sudah non aktif, maka tidak boleh muncul pada dropdown shift template

—

## Flow ID: SM-ST-009

* **Name :** Membuat shift template baru dengan pengaturan default  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Template  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat membuat shift template baru dengan pengaturan default.  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih Shift Template  
2. Anda akan diredirect ke [https\://staging.zappy.my.id/shift-templates](https://staging.zappy.my.id/shift-templates)  
3. Pada laman shift template list, tekan tombol “Add Shift Template” yang berada di ujung kanan atas  
4. Isi field-field yang diperlukan pada form tersebut dan pastikan di bagian bawah centang checkbox yang bertuliskan “Is Default”  
5. Jika sudah, tombol biru di paling bawah form  
6. Tolong cari kembali data yang baru saja dibuat di tabel all shift template  
7. Kemudian amati action button yang berada di paling kanan di row tersebut, dan periksa apakah tombol delete sudah menghilang atau belum.  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website  
- Shift template dengan pengaturan “Is Default”, maka data tersebut tidak dapat di delete.

—

## Flow ID: SM-ST-010

* **Name :** Melihat seluruh shift template yang telah dibuat di sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Template  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat melihat seluruh shift template yang telah dibuat di sistem  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih Shift Template  
2. Anda akan diredirect ke [https\://staging.zappy.my.id/shift-templates](https://staging.zappy.my.id/shift-templates)  
3. Pada laman shift template list, coba amati isi tabelnya dan kolom-kolomnya  
4. Tabel shift template memiliki kolom berikut : No, Name, Company, Business Unit, Working Hours, Break Hours, Status, Action  
* **Verification Points :**   
- Setiap data dapat terlihat jelas oleh user dan lengkap.

—

## Flow ID: SM-SC-001

* **Name :** Melihat seluruh shift schedule yang berbentuk kalender  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** All Shift Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat melihat seluruh shift schedule untuk tiap employee yang berbentuk kalender  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih All Shift Schedule  
2. Anda akan diredirect ke {{base-url}}[/all-shifts](https://staging.zappy.my.id/all-shifts)   
3. Pada laman All Shift Schedule ini, coba amati isi tabelnya  
4. Pastikan tabel dibuat dalam bentuk kalender yang difilter per 1 minggu dan pastikan setiap employee memiliki baris masing-masing  
* **Verification Points :**   
- Tabel sudah berbentuk kalender yang ditampilkan per minggu  
- Setiap employee memiliki baris masing-masing

—

## Flow ID: SM-SC-002

* **Name :** Melihat seluruh shift schedule untuk karyawan bawahannya  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** All Shift Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Manager  
* **Description :** Manager dapat melihat seluruh jadwal anak buahnya.  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Employee Self Service lalu pilih Subordinate Shift Schedule  
2. Anda akan diredirect ke {{Base-url}}/subordinate-shifts  
3. Pada laman Subordinate Shift List ini, coba amati isi tabelnya  
4. Pastikan employee yang ditampilkan hanya employee subordinate nya saja, bukan semua employee.  
* **Verification Points :**   
- Tabel sudah berbentuk kalender yang ditampilkan per minggu  
- Setiap employee memiliki baris masing-masing  
- Employee yang ditampilkan hanya employee subordinate dari si manager

—

## Flow ID: SM-SC-003

* **Name :** Membuat penugasan shift bertipe shift template pada employee tertentu  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** All Shift Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat membuat penugasan shift bertipe shift template pada employee tertentu  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih All Shift Schedule  
2. Anda akan diredirect ke {{base-url}}[/all-shifts](https://staging.zappy.my.id/all-shifts)   
3. Pada laman All Shift Schedule ini, tekan tombol “Create Work Schedule” di ujung kanan atas  
4. Kemudian akan muncul pop up form, silahkan isi seluruh detail shift yang ingin dibuat dan pilih employee yang ingin di assign  
5. Isi Schedule Type dengan “Shift Template”, Lalu di field Shift Template pilih template yang sudah dibuat sebelumnya  
6. Setelah, dibuat seharusnya akan muncul kotak biru pada karyawan dan tanggal yang bersesuaian dengan apa yang dibuat sebelumnya  
7. Pastikan informasi yang ada di kotak biru tersebut sesuai dengan apa yang diisi saat buat shift  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: SM-SC-004

* **Name :** Membuat penugasan shift bertipe manual shift pada employee tertentu  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** All Shift Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat membuat penugasan shift bertipe manual shift pada employee tertentu  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih All Shift Schedule  
2. Anda akan diredirect ke {{base-url}}[/all-shifts](https://staging.zappy.my.id/all-shifts)   
3. Pada laman All Shift Schedule ini, tekan tombol “Create Work Schedule” di ujung kanan atas  
4. Kemudian akan muncul pop up form, silahkan isi seluruh detail shift yang ingin dibuat dan pilih employee yang ingin di assign  
5. Isi Schedule Type dengan “Manual Schedule”, lalu isi field start time dan end time serta break start time dan break end timenya  
6. Setelah, dibuat seharusnya akan muncul kotak biru pada karyawan dan tanggal yang bersesuaian dengan apa yang dibuat sebelumnya  
7. Pastikan informasi yang ada di kotak biru tersebut sesuai dengan apa yang diisi saat buat shift  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: SM-SC-005

* **Name :** Menghapus shift yang sudah ditugaskan ke karyawan tertentu  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** All Shift Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat menghapus shift yang sudah ditugaskan ke karyawan tertentu  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih All Shift Schedule  
2. Anda akan diredirect ke {{base-url}}[/all-shifts](https://staging.zappy.my.id/all-shifts)   
3. Kemudian, cari shift yang ingin dihapus pada tanggal tertentu dan klik kotak biru shift tersebut  
4. Perlu dipastikan, untuk shift bertipe normal tidak dapat di klik kotak birunya (artinya tidak dapat diedit maupun di delete). Sedangkan untuk shift lain seperti shift, manual dan long shift dapat di klik kotak birunya (artinya dapat di edit maupun di delete)  
5. Setelah di klik, maka akan muncul pop up form untuk edit shift yang sudah ada  
6. Tekan tombol delete yang berada di ujung kiri bawah pop up untuk menghapus shift tersebut  
7. Akan ada pop up confirmation message, silahkan confirm saja proses penghapusannya  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website  
- Pastikan shift yang baru saja dihapus, tidak muncul di tabel kalender untuk karyawan tersebut

—

## Flow ID: SM-SC-006

* **Name :** Membuat penugasan multiple shift atau shift lebih dari satu untuk karyawan tertentu  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** All Shift Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat membuat penugasan multiple shift dengan tipe yang berbeda pada employee tertentu  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih All Shift Schedule  
2. Anda akan diredirect ke {{base-url}}[/all-shifts](https://staging.zappy.my.id/all-shifts)   
3. Pada laman All Shift Schedule ini, tekan tombol “Create Work Schedule” di ujung kanan atas  
4. Kemudian akan muncul pop up form, silahkan isi seluruh detail shift yang ingin dibuat dan pilih employee yang ingin di assign  
5. Isi Schedule Type dengan “Manual Schedule”, lalu isi field start time dan end time serta break start time dan break end timenya  
6. Setelah, dibuat seharusnya akan muncul kotak biru pada karyawan dan tanggal yang bersesuaian dengan apa yang dibuat sebelumnya  
7. Lakukan langkah 1 sampai 6 kembali untuk membuat shift kedua untuk karyawan yang sama. Pastikan tipe shiftnya berbeda dan jamnya juga tidak bertabrakan  
8. Pastikan terdapat dua kotak biru dan informasi yang ada di kotak tersebut sesuai dengan apa yang diisi saat buat shift  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: SM-SC-007

* **Name :** Menjalankan multiple filter pada laman All Shift Schedule  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** All Shift Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat menjalankan multiple filter pada laman all shift schedule  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih All Shift Schedule  
2. Anda akan diredirect ke {{base-url}}[/all-shifts](https://staging.zappy.my.id/all-shifts)   
3. Pada laman All Shift Schedule ini, coba lakukan filter untuk location, departement, dan shift  
4. Pastikan data shift yang ditampilkan di tabel sesuai dengan hasil filter tersebut  
* **Verification Points :**   
- Shift dan employee yang ditampilkan sesuai dengan filter yang dilakukan di location, departement, dan shift.

—

## Flow ID: SM-SC-008

* **Name :** Mengedit shift yang sudah ditugaskan ke karyawan tertentu  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** All Shift Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat mengedit shift yang sudah ditugaskan ke karyawan tertentu  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih All Shift Schedule  
2. Anda akan diredirect ke {{base-url}}[/all-shifts](https://staging.zappy.my.id/all-shifts)   
3. Kemudian, cari shift yang ingin diedit pada tanggal tertentu dan klik kotak biru shift tersebut  
4. Perlu dipastikan, untuk shift bertipe normal tidak dapat di klik kotak birunya (artinya tidak dapat diedit maupun di delete). Sedangkan untuk shift lain seperti shift, manual dan long shift dapat di klik kotak birunya (artinya dapat di edit maupun di delete)  
5. Setelah di klik, maka akan muncul pop up form untuk edit shift yang sudah ada  
6. Silahkan ganti field yang diperlukan, misal start time atau end timenya atau field yang lain bebas saja  
7. Jika sudah, tekan tombol update yang berada di ujung kanan bawah pop up form  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website  
- Pastikan shift yang baru saja diedit, informasinya berubah pada tabel kalender karyawan tersebut

—

## Flow ID: SM-SC-009

* **Name :** Membuat penugasan shift bertipe long shift pada employee tertentu  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** All Shift Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat membuat penugasan shift bertipe long shift pada employee tertentu  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih All Shift Schedule  
2. Anda akan diredirect ke {{base-url}}[/all-shifts](https://staging.zappy.my.id/all-shifts)   
3. Pada laman All Shift Schedule ini, tekan tombol “Create Work Schedule” di ujung kanan atas  
4. Kemudian akan muncul pop up form, silahkan isi seluruh detail shift yang ingin dibuat dan pilih employee yang ingin di assign  
5. Isi Schedule Type dengan “Long Shift”, lalu isi field start time dan end time serta break start time dan break end timenya  
6. Setelah, dibuat seharusnya akan muncul kotak biru pada karyawan dan tanggal yang bersesuaian dengan apa yang dibuat sebelumnya  
7. Pastikan informasi yang ada di kotak biru tersebut sesuai dengan apa yang diisi saat buat shift  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: SM-SC-010

* **Name :** Membuat penugasan multiple shift atau shift lebih dari satu untuk karyawan tertentu dengan waktu yang overlap/bertabrakan  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** All Shift Schedule  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat membuat penugasan multiple shift dengan tipe yang berbeda pada employee tertentu  
* **Flow Steps :**  
1. Pada navbar, masuk ke bagian Shift Management lalu pilih All Shift Schedule  
2. Anda akan diredirect ke {{base-url}}[/all-shifts](https://staging.zappy.my.id/all-shifts)   
3. Pada laman All Shift Schedule ini, tekan tombol “Create Work Schedule” di ujung kanan atas  
4. Kemudian akan muncul pop up form, silahkan isi seluruh detail shift yang ingin dibuat dan pilih employee yang ingin di assign  
5. Isi Schedule Type dengan “Manual Schedule”, lalu isi field start time dan end time serta break start time dan break end timenya  
6. Setelah, dibuat seharusnya akan muncul kotak biru pada karyawan dan tanggal yang bersesuaian dengan apa yang dibuat sebelumnya  
7. Lakukan langkah 1 sampai 6 kembali untuk membuat shift kedua untuk karyawan yang sama. Pastikan tipe shiftnya berbeda dan jamnya harus bertabrakan / overlap  
8. Pastikan terdapat dua kotak biru dan informasi yang ada di kotak tersebut sesuai dengan apa yang diisi saat buat shift  
* **Verification Points :**   
- Seharusnya muncul pesan error bahwa jamnya bertabrakan

—

## Flow ID: SM-RH-001

* **Name :** Melihat seluruh request shift untuk seluruh employee  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Request History  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat melihat seluruh request shift untuk seluruh employee  
* **Flow Steps :**  
1. Pada navbar masuk ke modul Shift Management, lalu pilih All Shift Request History  
2. Anda akan di redirect ke laman {base-url}/all-shift-request-history  
3. Silahkan pilih date rangenya pada filter di paling atas, lalu tekan tombol search  
4. Maka akan muncul seluruh data request untuk shift yang di assign pada range tersebut  
5. Pastikan tabel menampilan kolom ID, Request Date, Request User, Shift Date From, Shift Date To, Type, Total Employee, Start Time, End Time, Status, Action  
6. Anda juga bisa melakukan ini setelah membuat shift di scenario sebelumnya, pastikan requestnya ada sesuai shift yang dibuat  
* **Verification Points :**   
- Shift request yang ditampilkan sesuai dengan date range yang dipilih

—

## Flow ID: SM-RH-002

* **Name :** Melihat seluruh request shift untuk seluruh employee, tapi dengan date range yang salah  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Request History  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat melihat seluruh request shift untuk seluruh employee, tapi dengan date range yang salah  
* **Flow Steps :**  
1. Pada navbar masuk ke modul Shift Management, lalu pilih All Shift Request History  
2. Anda akan di redirect ke laman {base-url}/all-shift-request-history  
3. Silahkan pilih date rangenya yang tidak mungkin ada data shift request  
4. Pastikan tidak ada data shift request yang ditampilkan  
* **Verification Points :**   
- Shift request yang ditampilkan sesuai dengan date range yang dipilih

—

## Flow ID: SM-RH-003

* **Name :** Menghapus shift request history  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Shift Request History  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat menghapus shift request history   
* **Flow Steps :**  
1. Pada navbar masuk ke modul Shift Management, lalu pilih All Shift Request History  
2. Anda akan di redirect ke laman {base-url}/all-shift-request-history  
3. Silahkan pilih date rangenya pada filter di paling atas, lalu tekan tombol search  
4. Maka akan muncul seluruh data request untuk shift yang di assign pada range tersebut  
5. Pilih salah satu shift request yang ingin dihapus, lalu di kolom action tekan tombol ber icon tempat sampah untuk menghapus data tersebut  
6. Setelah dihapus, seharusnya data tersebut sudah hilang dari tabel Shift Request History  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: SM-WS-001

* **Name :** Membuat work schedule baru dengan waktu yang belum ada di sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Work Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat membuat work schedule baru dengan waktu yang belum ada di sistem  
* **Flow Steps :**  
1. Pada navbar, pilih Shift Management, lalu pilih Work Schedule  
2. Anda akan di redirect ke laman {base\_url}/work-schedules  
3. Pada laman Work Schedule List, silahkan tekan tombol “Add Work Schedule” di ujung kanan atas laman  
4. Isi field yang diperlukan, termasuk start time, end time, break in start time, break in end time.  
5. Jika sudah tekan tombol Create di paling ujung kanan bawah.  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website  
- Data schedule yang baru saja dibuat, seharusnya muncul di tabel Work Schedule List

—

## Flow ID: SM-WS-002

* **Name :** Membuat work schedule baru dengan mandatory field yang tidak diisi  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Work Schedule  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin tidak dapat membuat work schedule baru dengan mandatory field yang tidak diisi  
* **Flow Steps :**  
1. Pada navbar, pilih Shift Management, lalu pilih Work Schedule  
2. Anda akan di redirect ke laman {base\_url}/work-schedules  
3. Pada laman Work Schedule List, silahkan tekan tombol “Add Work Schedule” di ujung kanan atas laman  
4. Isi field beberapa field, dan coba kosongkan field mandatory  
5. Jika sudah tekan tombol Create di paling ujung kanan bawah.  
* **Verification Points :**   
- Seharusnya akan muncul pesan error di bawah setiap field yang kosong.

—

## Flow ID: SM-WS-003

* **Name :** Membuat work schedule baru dengan kombinasi Business Unit, Company dan Job Position serta kombinasi weekday dan work time conf yang sama dengan schedules yang sudah terdaftar  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Work Schedule  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin tidak dapat membuat work schedule baru dengan kombinasi Business Unit, Company dan Job Position serta kombinasi weekday dan work time conf yang sama dengan schedules yang sudah terdaftar  
* **Flow Steps :**  
1. Pada navbar, pilih Shift Management, lalu pilih Work Schedule  
2. Anda akan di redirect ke laman {base\_url}/work-schedules  
3. Pada laman Work Schedule List, silahkan tekan tombol “Add Work Schedule” di ujung kanan atas laman  
4. Isi dengan kombinasi Business Unit, Company dan Job Position serta kombinasi weekday dan work time conf yang sama dengan schedules yang sudah terdaftar (artinya sebelum membuat, coba cek terlebih dahulu kombinasi apa saja yang sudah terdaftar di sistem melalui tabel all work schedule list)  
5. Jika sudah tekan tombol Create yang berada di ujung kanan bawah  
* **Verification Points :**   
- Seharusnya akan muncul pesan error di atas.

—

## Flow ID: SM-WS-004

* **Name :** Mengedit untuk work schedule yang sudah ada di sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Work Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat mengedit untuk work schedule yang sudah ada di sistem  
* **Flow Steps :**  
1. Pada navbar, pilih Shift Management, lalu pilih Work Schedule  
2. Anda akan di redirect ke laman {base\_url}/work-schedules  
3. Pilih work schedule data yang ingin di edit, kemudian di paling kanan tekan tombol pensil di kolom action  
4. Ubah field yang ingin diubah, dan jika sudah tekan tombol save di ujung paling kanan  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: SM-WS-005

* **Name :** Mengedit untuk work schedule yang sudah ada di sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Work Schedule  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat mengedit untuk work schedule yang sudah ada di sistem  
* **Flow Steps :**  
1. Pada navbar, pilih Shift Management, lalu pilih Work Schedule  
2. Anda akan di redirect ke laman {base\_url}/work-schedules  
3. Pilih work schedule data yang ingin di edit, kemudian di paling kanan tekan tombol pensil di kolom action  
4. Coba kosongkan beberapa field mandatory, lalu tekan save di bawah  
* **Verification Points :**   
- Seharusnya akan muncul pesan error di bawah field yang required

—

## Flow ID: SM-WS-006

* **Name :** Menonaktifkan work schedule yang sudah ada di sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Work Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat menonaktifkan work schedule yang sudah ada di sistem  
* **Flow Steps :**  
1. Pada navbar, pilih Shift Management, lalu pilih Work Schedule  
2. Anda akan di redirect ke laman {base\_url}/work-schedules  
3. Pilih work schedule data yang masih berstatus active, kemudian di paling kanan tekan tombol pensil di kolom action  
4. Ganti field statusnya menjadi inactive  
5. JIka sudah, tekan tombol save di paling bawah form  
* **Verification Points :**   
- Seharusnya akan muncul pesan error di atas.

—

## Flow ID: SM-WS-007

* **Name :** Melihat seluruh work schedule yang sudah ada di sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Shift Management  
* **Submodule :** Work Schedule  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Admin dapat melihat seluruh work schedule yang sudah ada di sistem  
* **Flow Steps :**  
1. Pada navbar, pilih Shift Management, lalu pilih Work Schedule  
2. Anda akan di redirect ke laman {base\_url}/work-schedules  
3. Silahkan amati tabel yang ditampilkan dan pastikan terdapat informasi berikut : Name, Day, Working Hours, Break Hours, Company, Business Unit, Job Position, Status, dan Action.  
4. Anda juga bisa mencoba filter yang ada di paling atas laman seperti “search by name”, “Company”, “Business Unit”, “Job Position”, dan “Status”  
5. Setelah filter, tolong pastikan data yang ditampilkan sesuai dengan filter yang telah dilakukan.  
* **Verification Points :**   
- Data yang ditampilkan sesuai dengan apa yang di filter.