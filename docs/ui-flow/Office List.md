# Test Flow Documentation: Office List

**Module Links :**

- [https://staging.zappy.my.id/locations](https://staging.zappy.my.id/locations)  
- [https://staging.zappy.my.id/office/list](https://staging.zappy.my.id/office/list)

## Flow ID: OL-001

* **Name :** Membuat lokasi baru dengan valid required field  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Location  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat membuat lokasi baru dengan seluruh field terisi dan bernilai valid  
* **Flow Steps :**  
1. Masuk ke menu Employee Management, lalu pilih Location.  
2. Pada laman \`https://staging.zappy.my.id/locations\`, tekan tombol Add Location.  
3. Isi field secara berurutan: location name, location code, location email, phone number, fax, business unit, address, province, city, postal code, lattitude, longitude, office location radius, office status, attendance on mobile, location tax name, Location NITKU, Location NPWP 15 digit (old), Location NPWP 16 digit (new), Tax Holder Name, Tax holder NPWP 15 digit (old), Tax Holder NPWP 16 digit (new), KLU code (Klasifikasi Lapangan Usaha), JHT Payment Source, BPJS Payment Source. (Sesuaikan value dengan tipe field).  
4. Tekan tombol Save.  
5. Sistem akan melakukan redirect ke laman location list (\`https://staging.zappy.my.id/locations\`). Pastikan lokasi yang baru dibuat muncul di baris paling atas dengan data yang sesuai.  
6. Pada laman yang sama, lihat detail data lokasi yang baru dibuat dengan menekan tombol mata di samping kanan.  
7. Sistem akan melakukan redirect ke laman detail (\`https://staging.zappy.my.id/location/\[id\]\`).  
8. Pastikan data lokasi sesuai dengan data yang diinput di awal.  
* **Verification Points :**   
- Muncul toast notifikasi berwarna hijau di bagian atas website setelah aksi berhasil.  
- Value pada field terisi sesuai dengan tipe field (dropdown, checkbox, input text).

—

## Flow ID: OL-002

* **Name :** Sistem otomatis membuat data office baru setelah membuat lokasi   
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Office   
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Sistem seharusnya membuat data office baru sesuai dengan data yang diinput saat membuat location.  
* **Flow Steps :**  
1. Setelah lokasi baru berhasil dibuat (berdasarkan OL-001), masuk ke menu Attendance Management lalu pilih Office List.   
2. Sistem akan melakukan redirect ke \`https://staging.zappy.my.id/office/list\`.   
3. Cari data office yang sesuai berdasarkan nama lokasi yang baru saja dibuat.   
4. Pastikan informasi pada tabel sesuai dengan data awal (office name, latitude, longitude, office location radius, dan location).   
* **Verification Points :**   
- Data office harus ada di tabel sesuai dengan data yang diinput saat pembuatan lokasi baru.

—

## Flow ID: OL-003

* **Name :** Melakukan edit data pada lokasi yang telah dibuat  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Office   
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat melakukan edit lokasi pada sistem  
* **Flow Steps :**  
1. Masuk ke Employee Management, lalu ke Location  
2. Anda akan di redirect ke https://staging.zappy.my.id/locations  
3. Pada laman tersebut, cari data lokasi yang baru saja dibuat pada flow pertama. Silahkan manfaatkan fitur search dan filter di paling atas untuk mencari data lokasi yang sesuai  
4. Tolong lakukan edit lokasi pada data lokasi yang di flow pertama dibuat dengan cara menekan tombol pensil di row data lokasi yang baru saja dibuat di paling kanan  
5. Anda akan di redirect ke laman edit location, silahkan edit data yang ingin diedit, bebas saja  
6. Kemudian tekan tombol save  
7. Setelah berhasil tersimpan, anda akan kembali ke laman location list  
8. Pastikan data lokasi yang tadi sesuai dengan data terbaru. Jika di tabel tidak ada informasi yang baru saja anda edit, silahkan lihat detailnya dengan menekan tombol mata  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: OL-004

* **Name :** Menghapus data lokasi pada sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Location  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat menghapus lokasi pada sistem  
* **Flow Steps :**  
1. Masuk ke Employee Management, lalu ke Location  
2. Anda akan di redirect ke https://staging.zappy.my.id/locations  
3. Pada laman  location list, anda perlu menghapus data lokasi yang anda buat ada flow sebelumnya  
4. Silahkan cari data lokasi yang baru saja dibuat, bisa menggunakan search dan filter di atas  
5. Kemudian, di baris lokasi yang sesuai tekan tombol tong sampah di paling kanan  
6. Akan muncul pop up konfirmasi, silahkan konfirmasi untuk delete  
7. Pastikan data lokasi yang baru saja dihapus tidak ada / muncul di location list  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: OL-004

* **Name :** Menghapus data lokasi pada sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Location  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat menghapus lokasi pada sistem  
* **Flow Steps :**  
1. Masuk ke Employee Management, lalu ke Location  
2. Anda akan di redirect ke https://staging.zappy.my.id/locations  
3. Pada laman  location list, anda perlu menghapus data lokasi yang anda buat pada flow sebelumnya  
4. Silahkan cari data lokasi yang baru saja dibuat, bisa menggunakan search dan filter di atas  
5. Kemudian, di baris lokasi yang sesuai tekan tombol tong sampah di paling kanan  
6. Akan muncul pop up konfirmasi, silahkan konfirmasi untuk delete  
7. Pastikan data lokasi yang baru saja dihapus tidak ada / muncul di location list  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast berwarna hijau di paling atas website

—

## Flow ID: OL-005

* **Name :** Membuat data office baru dengan valid required field  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Office  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat membuat data office baru pada sistem  
* **Flow Steps :**  
1. Silahkan ke Attendance Management lalu ke Office List  
2. Maka anda akan di redirect ke https://staging.zappy.my.id/office/list  
3. Pada laman ini, tekan tombol Add Office  
4. Setelah itu, akan muncul pop up form, tolong isi seluruh field yang diperlukan seperti Office Name, Latitude, Longitude, Location, Office Location Radius dan Status  
5. Jika sudah diisi, tekan tombol create  
6. Jika berhasil, maka data office terbaru harusnya muncul di office list  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast bewarna hijau di paling atas website

—

## Flow ID: OL-006

* **Name :** Mengedit data office yang telah dibuat dengan valid value  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Office  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat melakukan edit pada data office yang ada di sistem  
* **Flow Steps :**  
1. Silahkan ke Attendance Management lalu ke Office List  
2. Maka anda akan di redirect ke https://staging.zappy.my.id/office/list  
3. Pada laman tersebut, cari data office yang baru saja dibuat pada flow sebelumnya. Silahkan manfaatkan fitur filter di paling atas untuk mencari data yang sesuai  
4. Tolong lakukan edit office pada data office yang di flow sebelumnya dibuat dengan cara menekan tombol pensil di paling kanan  
5. Akan muncul pop up form untuk melakukan edit pada data office. Silahkan edit pada informasi yang ingin di edit  
6. Kemudian tekan tombol save  
7. Setelah berhasil tersimpan, maka pop up hilang dan anda akan melihat kembali tabel office list  
8. Pastikan data office yang tadi sesuai dengan data terbaru.  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast bewarna hijau di paling atas website

—

## Flow ID: OL-007

* **Name :** Menghapus data office yang telah dibuat di sistem  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Office  
* **Type :** Positive  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** User dapat menghapus data office yang ada di sistem  
* **Flow Steps :**  
1. Silahkan ke Attendance Management lalu ke Office List  
2. Maka anda akan di redirect ke https://staging.zappy.my.id/office/list  
3. Pada laman tersebut, cari data office yang baru saja dibuat pada flow sebelumnya. Silahkan manfaatkan fitur filter di paling atas untuk mencari data yang sesuai  
4. Kemudian, di baris office yang sesuai tekan tombol tong sampah di paling kanan  
5. Akan muncul pop up konfirmasi, silahkan konfirmasi untuk delete  
6. Pastikan data office yang baru saja dihapus tidak ada / muncul di office list"  
* **Verification Points :**   
- Setiap setelah aksi berhasil, maka akan muncul toast bewarna hijau di paling atas website  
* **Notes :**   
- Sepertinya pada sistem saat ini fitur ini belum berjalan, mohon dimaklumi jika test ini tidak berhasil.  
- Test script tetap perlu dibuat untuk testing kedepannya

—

## Flow ID: OL-008

* **Name :** Membuat lokasi baru dengan tidak semua required field terisi  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Location  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Sistem melakukan validasi bahwa field required wajib diisi dan optional tidak wajib diisi  
* **Flow Steps :**  
1. Masuk ke Employee Management, lalu ke Location  
2. Pada laman https://staging.zappy.my.id/locations, tekan tombol add location  
3. Isi field bebas saja dan pastikan ada required field yang kosong serta pastikan juga optional field dikosongkan juga  
4. Jika sudah, tekan tombol save  
5. Pastikan muncul pesan error yang sesuai"  
* **Verification Points :**   
- Jika required field tidak diisi, maka akan muncul pesan error di bawah setiap fieldnya

—

## Flow ID: OL-009

* **Name :** Membuat lokasi baru dengan value yang tidak sesuai  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Location  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Sistem melakukan validasi  bahwa value yang diinput user tidak sesuai dengan apa yang diminta sistem  
* **Flow Steps :**  
1. Masuk ke Employee Management, lalu ke Location  
2. Pada laman https://staging.zappy.my.id/locations, tekan tombol add location  
3. Isi beberapa field dengan value / format yang tidak sesuai  
4. Jika sudah, tekan tombol save  
5. Pastikan muncul pesan error yang sesuai  
* **Verification Points :**   
- Jika terdapat field dengan value /  format yang tidak sesuai, maka akan muncul pesan error di bawah setiap fieldnya atau bisa saja muncul pesan error dipaling atas form

—

## Flow ID: OL-010

* **Name :** Melakukan edit data pada lokasi yang telah dibuat dengan tidak semua required field terisi  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Location  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Sistem melakukan validasi bahwa required field wajib diisi saat edit  
* **Flow Steps :**  
1. Masuk ke Employee Management, lalu ke Location  
2. Anda akan di redirect ke https://staging.zappy.my.id/locations  
3. Pada laman tersebut, cari data lokasi yang baru saja dibuat pada flow pertama. Silahkan manfaatkan fitur search dan filter di paling atas untuk mencari data lokasi yang sesuai  
4. Tolong lakukan edit lokasi pada data lokasi yang di flow pertama dibuat dengan cara menekan tombol pensil di row data lokasi yang baru saja dibuat di paling kanan  
5. Anda akan di redirect ke laman edit location, silahkan edit data dan pastikan kosongkan beberapa required field  
6. Kemudian tekan tombol save  
7. Pastikan terdapat pesan error yang sesuai"  
* **Verification Points :**   
- Jika required field tidak diisi, maka akan muncul pesan error dibawah setiap fieldnya

—

## Flow ID: OL-011

* **Name :** Melakukan edit data pada lokasi yang telah dibuat dengan value yang tidak sesuai  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Location  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Sistem melakukan validasi  bahwa value yang diinput user tidak sesuai dengan apa yang diminta sistem  
* **Flow Steps :**  
1. Masuk ke Employee Management, lalu ke Location  
2. Anda akan di redirect ke https://staging.zappy.my.id/locations  
3. Pada laman tersebut, cari data lokasi yang baru saja dibuat pada flow pertama. Silahkan manfaatkan fitur search dan filter di paling atas untuk mencari data lokasi yang sesuai  
4. Tolong lakukan edit lokasi pada data lokasi yang di flow pertama dibuat dengan cara menekan tombol pensil di row data lokasi yang baru saja dibuat di paling kanan  
5. Anda akan di redirect ke laman edit location, silahkan edit data dan pastikan beberapa field diisi dengan value yang salah  
6. Kemudian tekan tombol save  
7. Pastikan terdapat pesan error yang sesuai"  
* **Verification Points :**   
- Jika terdapat field dengan value /  format yang tidak sesuai, maka akan muncul pesan error di bawah setiap fieldnya atau bisa saja muncul pesan error dipaling atas form

—

## Flow ID: OL-012

* **Name :** Membuat data office baru dengan tidak semua required field terisi  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Office  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Sistem melakukan validasi bahwa required field wajib diisi saat edit  
* **Flow Steps :**  
1. Silahkan ke Attendance Management lalu ke Office List  
2. Maka anda akan di redirect ke https://staging.zappy.my.id/office/list  
3. Pada laman ini, tekan tombol Add Office  
4. Setelah itu, akan muncul pop up form, silahkan isi field dan pastikan kosongkan beberapa field required  
5. Setelah itu, tekan tombol Create  
6. Pastikan terdapat pesan error yang sesuai"  
* **Verification Points :**   
- Jika required field tidak diisi, maka akan muncul pesan error dibawah setiap fieldnya

—

## Flow ID: OL-013

* **Name :** Membuat data office baru dengan invalid value  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Office  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Sistem melakukan validasi  bahwa value yang diinput user tidak sesuai dengan apa yang diminta sistem  
* **Flow Steps :**  
1. Silahkan ke Attendance Management lalu ke Office List  
2. Maka anda akan di redirect ke https://staging.zappy.my.id/office/list  
3. Pada laman ini, tekan tombol Add Office  
4. Setelah itu, akan muncul pop up form, silahkan isi field dan pastikan kosongkan beberapa field required  
5. Setelah itu, tekan tombol Create  
6. Pastikan terdapat pesan error yang sesuai"  
* **Verification Points :**   
- Jika terdapat field dengan value /  format yang tidak sesuai, maka akan muncul pesan error di bawah setiap fieldnya atau bisa saja muncul pesan error dipaling atas form

—

## Flow ID: OL-014

* **Name :** Mengedit data office yang telah dibuat dengan tidak semua required field terisi  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Office  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Sistem melakukan validasi bahwa required field wajib diisi saat edit  
* **Flow Steps :**  
1. Silahkan ke Attendance Management lalu ke Office List  
2. Maka anda akan di redirect ke https://staging.zappy.my.id/office/list  
3. Pada laman tersebut, cari data office yang baru saja dibuat pada flow sebelumnya. Silahkan manfaatkan fitur filter di paling atas untuk mencari data yang sesuai  
4. Tolong lakukan edit office pada data office yang di flow sebelumnya dibuat dengan cara menekan tombol pensil di paling kanan  
5. Akan muncul pop up form untuk melakukan edit pada data office. Silahkan edit pada informasi yang ingin di edit dan pastikan beberapa required field di kosongkan  
6. Kemudian tekan tombol save  
7. Pastikan muncul pesan error yang sesuai"  
* **Verification Points :**   
- Jika required field tidak diisi, maka akan muncul pesan error dibawah setiap fieldnya

—

## Flow ID: OL-015

* **Name :** Mengedit data office yang telah dibuat dengan invalid value  
* **Project :** HRIS Ascendiz UI  
* **Module :** Office List  
* **Submodule :** Office  
* **Type :** Negative  
* **Priority :** P0  
* **Role Required :** Admin  
* **Description :** Sistem melakukan validasi  bahwa value yang diinput user tidak sesuai dengan apa yang diminta sistem  
* **Flow Steps :**  
1. Silahkan ke Attendance Management lalu ke Office List  
2. Maka anda akan di redirect ke https://staging.zappy.my.id/office/list  
3. Pada laman tersebut, cari data office yang baru saja dibuat pada flow sebelumnya. Silahkan manfaatkan fitur filter di paling atas untuk mencari data yang sesuai  
4. Tolong lakukan edit office pada data office yang di flow sebelumnya dibuat dengan cara menekan tombol pensil di paling kanan  
5. Akan muncul pop up form untuk melakukan edit pada data office. Silahkan edit pada informasi yang ingin di edit dan pastikan isi dengan format atau value yang tidak sesuai  
6. Kemudian tekan tombol save  
7. Pastikan muncul pesan error yang sesuai"  
* **Verification Points :**   
- Jika terdapat field dengan value /  format yang tidak sesuai, maka akan muncul pesan error di bawah setiap fieldnya atau bisa saja muncul pesan error dipaling atas form