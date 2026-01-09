systemctl stop systemd-resolved

ifconfig
ip route
sleep 10

echo "nameserver 223.5.5.5" > /etc/resolv.conf
echo "nameserver 114.114.114.114" >> /etc/resolv.conf

    swapon /dev/sda2
    
    mount -o compress=zstd,subvol=@ /dev/sda3 /mnt
    
    mount -o compress=zstd,subvol=@home /dev/sda3 /mnt/home
    
    mount /dev/sda1 /mnt/boot
    
    timedatectl set-ntp true
    
    lsblk
    