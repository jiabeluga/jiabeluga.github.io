swapon /dev/sda2
    
mount -o compress=zstd,subvol=@ /dev/sda3 /mnt
    
mount -o compress=zstd,subvol=@home /dev/sda3 /mnt/home
    
mount /dev/sda1 /mnt/boot
    
timedatectl set-ntp true
    
lsblk
    
